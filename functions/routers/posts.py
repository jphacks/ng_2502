# routers/posts.py
import asyncio
from fastapi import APIRouter, Depends
from firebase_admin import firestore, firestore as admin_firestore
from auth.dependencies import get_current_user

router = APIRouter()
db = firestore.client()

# --- 投稿一覧取得API ---
@router.get("/posts")
async def get_posts(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch():
        docs = (
            db.collection("posts")
            .where("replyTo", "==", None)
            .where("userId", "==", user_id)
            .order_by("timestamp", direction=admin_firestore.Query.DESCENDING)
            .stream()
        )

        posts_list = []

        for doc in docs:
            post_data = doc.to_dict()
            post_data["id"] = doc.id
            post_data["predictedLikes"] = post_data.get("predictedLikes", 0)

            # --- ユーザー情報を付与 ---
            user_id_from_post = post_data.get("userId")

            if user_id_from_post:
                try:
                    user_ref = db.collection("users").document(user_id_from_post)
                    user_doc = user_ref.get()

                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        post_data["user"] = {
                            "username": user_data.get("username", "ユーザー名"),
                            "iconColor": user_data.get("iconColor", "blue"),
                        }
                    else:
                        post_data["user"] = {
                            "username": "ユーザー名",
                            "iconColor": "blue",
                        }

                except Exception as e:
                    print(f"⚠️ ユーザー