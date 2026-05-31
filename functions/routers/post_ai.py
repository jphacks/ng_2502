from fastapi import APIRouter, Depends, HTTPException
from functions.auth.dependencies import get_current_user
from datetime import datetime, timezone
import functions.config.firebase as firebase
from functions.ai_post_generator import generate_ai_post_text
import random

router = APIRouter()

# ★ ランダムAIキャラ名
AI_NAMES = [
    "あい", "じぇみー", "ぐー", "ちゃぴ", "こぱ",
    "ロット", "りあ", "ふぁいあ", "アラン", "くら",
    "かに", "くじら", "ほっけ", "たこ", "さけ",
    "たい", "ぺんぎん", "いるか", "あざらし",
    "カジキ", "チュナ", "ぱくぱく", "もぐ"
]

# ★ ランダムアイコンカラー
AI_COLORS = ["purple", "blue", "green", "pink", "orange"]


def get_db():
    if firebase.db is None:
        raise RuntimeError("❌ Firebase初期化エラー: db が None です")
    return firebase.db


@router.post("/post/ai")
async def create_ai_post(user_id: str = Depends(get_current_user)):
    try:
        print(f"🔥 AI投稿エンドポイント呼び出し - user_id: {user_id}")

        db = get_db()
        print(f"✅ Firebase db 接続成功")

        print(f"🔥 AI投稿テキスト生成中...")
        ai_data = await generate_ai_post_text()
        print(f"✅ AI投稿生成完了: {ai_data}")

        if not ai_data or not ai_data.get("content"):
            raise ValueError("AI投稿生成エラー: content が空です")

        print(f"🔥 Firestore に保存中...")

        # ★ ランダムAIキャラ
        ai_name = random.choice(AI_NAMES)
        ai_color = random.choice(AI_COLORS)

        # Firestore 保存
        doc_ref = db.collection("posts").document()
        doc_ref.set({
            "userId": f"ai-system-{user_id}",  # ← ユーザーごとにAI投稿を分離
            "user": {
                "username": ai_name,          # ← ランダムAI名
                "iconColor": ai_color         # ← ランダムカラー
            },
            "content": ai_data["content"],
            "imageUrl": None,
            "replyTo": None,
            "timestamp": datetime.now(timezone.utc),
            "likes": [],
            "isPositive": False,
            "predictedReplyCount": 0,
            "predictedLikes": 0,
            "isControversial": False,
            "isViral": False,
            "aiComments": [],
            "riskLevel": ai_data.get("riskLevel", "unknown"),
            "riskReason": ai_data.get("riskReason", ""),
        })

        print(f"✅ Firestore 保存成功")

        return {
            "message": "AI投稿作成完了",
            "postId": doc_ref.id,
            "content": ai_data["content"],
            "riskLevel": ai_data.get("riskLevel"),
            "riskReason": ai_data.get("riskReason"),
        }

    except Exception as e:
        print(f"❌ AI投稿作成エラー: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Firebase保存エラー: {type(e).__name__}: {str(e)}")
