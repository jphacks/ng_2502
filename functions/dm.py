# functions/dm.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from firebase_admin import firestore, auth
from datetime import datetime, timezone
import asyncio

# ★ ここで Router を定義（main.py にはこれだけ渡します）
router = APIRouter()

# --- 1. 独立した認証ロジック ---
# main.py の get_current_user と同じ仕組みをここで定義します。
# これにより、main.py からインポートする必要がなくなり、衝突を回避できます。
bearer_scheme = HTTPBearer()

def get_current_user_dm(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """DM機能専用の認証チェック関数"""
    if cred is None:
        raise HTTPException(status_code=401, detail="Bearer token missing")
    try:
        # Firebaseのトークン検証
        decoded_token = auth.verify_id_token(cred.credentials)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")

# --- 2. データモデル定義 ---
class DMRoomRequest(BaseModel):
    targetUserId: str

class DMMessageRequest(BaseModel):
    roomId: str
    content: str

# --- 3. DM機能の実装 ---

@router.post("/dm/room")
# async def get_or_create_dm_room(payload: DMRoomRequest, user_id: str = Depends(get_current_user_dm)): # 元のコードをコメントアウト
async def get_or_create_dm_room(payload: DMRoomRequest): # 引数から user_id を消す
    user_id = "test_user_A"  # ★テスト用にIDを固定！
    """DMルームの取得または作成"""
    # main.pyですでに初期化されているはずなので、ここではクライアントを取得するだけ
    db = firestore.client()
    
    target_id = payload.targetUserId
    if user_id == target_id:
        raise HTTPException(status_code=400, detail="自分自身とはチャットできません")

    loop = asyncio.get_running_loop()

    def process_room():
        # 既存ルームの検索
        docs = db.collection("rooms").where("participants", "array_contains", user_id).stream()
        for doc in docs:
            data = doc.to_dict()
            if target_id in data.get("participants", []):
                return {"roomId": doc.id, "isNew": False}
        
        # 新規作成
        new_room_data = {
            "participants": [user_id, target_id],
            "lastMessage": "",
            "updatedAt": datetime.now(timezone.utc),
            "createdAt": datetime.now(timezone.utc)
        }
        new_ref = db.collection("rooms").document()
        new_ref.set(new_room_data)
        return {"roomId": new_ref.id, "isNew": True}

    return await loop.run_in_executor(None, process_room)


@router.post("/dm/message")
# async def send_dm_message(payload: DMMessageRequest, user_id: str = Depends(get_current_user_dm)):
async def send_dm_message(payload: DMMessageRequest):
    user_id = "test_user_A" # ★テスト用にIDを固定！
    """メッセージ送信処理"""
    db = firestore.client()
    loop = asyncio.get_running_loop()

    def write_message():
        room_ref = db.collection("rooms").document(payload.roomId)
        room_snapshot = room_ref.get()
        
        if not room_snapshot.exists:
             raise HTTPException(status_code=404, detail="ルームが見つかりません")
        
        # 参加者チェック
        if user_id not in room_snapshot.to_dict().get("participants", []):
             raise HTTPException(status_code=403, detail="権限がありません")

        batch = db.batch()
        
        # メッセージ保存
        message_ref = room_ref.collection("messages").document()
        new_message = {
            "senderId": user_id,
            "content": payload.content,
            "timestamp": datetime.now(timezone.utc),
            "read": False
        }
        batch.set(message_ref, new_message)

        # ルーム情報更新
        batch.update(room_ref, {
            "lastMessage": payload.content,
            "updatedAt": datetime.now(timezone.utc)
        })
        
        batch.commit()
        return message_ref.id

    msg_id = await loop.run_in_executor(None, write_message)
    return {"message": "送信成功", "messageId": msg_id}