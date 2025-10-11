from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from google.cloud import firestore
from datetime import datetime, timezone
import asyncio
import os

app = FastAPI()

# エミュレータ判定
if os.getenv("FIRESTORE_EMULATOR_HOST"):
    print("🔥 Firestore Emulator に接続しています:", os.getenv("FIRESTORE_EMULATOR_HOST"))
    db = firestore.Client(project="myfirstfirebase-440d6") # myfirstfirebase-440d6
else:
    print("⚠️ 本番Firestoreに接続しています")
    db = firestore.Client()

class PostCreate(BaseModel):
    userId: str
    content: str
    imageUrl: Optional[str] = None
    replyTo: Optional[str] = None

@app.post("/post")
async def create_post(payload: PostCreate):
    # payload は pydantic がバリデーション済み
    post = payload.dict()
    post["timestamp"] = datetime.now(timezone.utc)  # タイムゾーン付き

    loop = asyncio.get_running_loop()

    # 同期APIをスレッドで呼ぶ（イベントループをブロックしない）
    def write():
        doc_ref = db.collection("posts").document()  # 新しい自動ID
        doc_ref.set(post)
        return doc_ref.id

    post_id = await loop.run_in_executor(None, write)
    return {"message": "投稿完了", "postId": post_id}

@app.post("/like/{post_id}")
async def toggle_like(post_id: str, body: dict):
    user_id = body.get("userId")
    if not user_id:
        raise HTTPException(status_code=400, detail="userId is required")

    loop = asyncio.get_running_loop()

    def toggle():
        post_ref = db.collection("posts").document(post_id)
        doc = post_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict() or {}
        likes = data.get("likes", [])
        # race condition を避けるため ArrayUnion/ArrayRemove を使う
        if user_id in likes:
            post_ref.update({"likes": firestore.ArrayRemove([user_id])})
        else:
            post_ref.update({"likes": firestore.ArrayUnion([user_id])})
        # 再読み込みして返す
        return post_ref.get().to_dict().get("likes", [])

    new_likes = await loop.run_in_executor(None, toggle)
    if new_likes is None:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    return {"message": "いいね更新", "likes": new_likes}

@app.get("/replies/{post_id}")
async def get_replies(post_id: str):
    loop = asyncio.get_running_loop()
    def fetch():
        docs = db.collection("posts") \
                .where("replyTo", "==", post_id) \
                .order_by("timestamp") \
                .stream()
        return [{"id": d.id, **d.to_dict()} for d in docs]
    results = await loop.run_in_executor(None, fetch)
    return results
