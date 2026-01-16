# routers/posts.py
import asyncio
from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
from functions.config.firebase import db

router = APIRouter()

# リプライ取得
@router.get("/replies/{post_id}")
async def get_replies(post_id: str):
    loop = asyncio.get_running_loop()

    def fetch():
        docs = (
            db.collection("posts")
            .where("replyTo", "==", post_id)
            .order_by("timestamp")
            .stream()
        )

        replies_list = []

        for doc in docs:
            reply_data = doc.to_dict()
            reply_data["id"] = doc.id

            # ユーザー情報を取得
            user_id = reply_data.get("userId")
            if user_id:
                try:
                    user_ref = db.collection("users").document(user_id)
                    user_doc = user_ref.get()

                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        reply_data["user"] = {
                            "username": user_data.get("username", "ユーザー名"),
                            "iconColor": user_data.get("iconColor", "blue"),
                        }
                    else:
                        reply_data["user"] = {
                            "username": "ユーザー名",
                            "iconColor": "blue",
                        }

                except Exception as e:
                    print(f"⚠️ ユーザー情報取得エラー (userId={user_id}): {e}")
                    reply_data["user"] = {
                        "username": "ユーザー名",
                        "iconColor": "blue",
                    }
            else:
                reply_data["user"] = {
                    "username": "ユーザー名",
                    "iconColor": "blue",
                }

            replies_list.append(reply_data)

        return replies_list

    results = await loop.run_in_executor(None, fetch)
    return results