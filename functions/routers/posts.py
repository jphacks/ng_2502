# routers/posts.py
import asyncio
from fastapi import APIRouter, Depends
from firebase_admin import firestore as admin_firestore
from functions.auth.dependencies import get_current_user
import functions.config.firebase as firebase

router = APIRouter()

FIRESTORE_IN_LIMIT = 30


def _chunk(lst: list, size: int):
    for i in range(0, len(lst), size):
        yield lst[i : i + size]


def _fetch_posts_for_uids(db, uid_chunk: list) -> list:
    docs = (
        db.collection("posts")
        .where("replyTo", "==", None)
        .where("userId", "in", uid_chunk)
        .order_by("timestamp", direction=admin_firestore.Query.DESCENDING)
        .stream()
    )
    posts = []
    for doc in docs:
        post_data = doc.to_dict()
        post_data["id"] = doc.id
        if post_data.get("tab") == "friends":
            post_data["predictedLikes"] = len(post_data.get("likes", []))
        else:
            post_data["predictedLikes"] = post_data.get("predictedLikes", 0)

        uid_from_post = post_data.get("userId", "")
        if not uid_from_post.startswith("ai-system-"):
            try:
                user_doc = db.collection("users").document(uid_from_post).get()
                if user_doc.exists:
                    u = user_doc.to_dict()
                    post_data["user"] = {
                        "username": u.get("username", "ユーザー名"),
                        "iconColor": u.get("iconColor", "blue"),
                    }
                else:
                    post_data["user"] = {"username": "ユーザー名", "iconColor": "blue"}
            except Exception as e:
                print(f"⚠️ ユーザー情報取得エラー (userId={uid_from_post}): {e}")
                post_data["user"] = {"username": "ユーザー名", "iconColor": "blue"}
        posts.append(post_data)
    return posts


# --- 投稿一覧取得API ---
@router.get("/posts")
async def get_posts(
    user_id: str = Depends(get_current_user),
    includeFriends: bool = False,
):
    loop = asyncio.get_running_loop()

    def fetch():
        db = firebase.db
        target_uids = [user_id]

        if includeFriends:
            user_doc = db.collection("users").document(user_id).get()
            if user_doc.exists:
                target_uids.extend(user_doc.to_dict().get("friends", []))
        else:
            target_uids.append(f"ai-system-{user_id}")

        all_posts = []
        for chunk in _chunk(target_uids, FIRESTORE_IN_LIMIT):
            all_posts.extend(_fetch_posts_for_uids(db, chunk))

        # チャンクが複数になった場合は timestamp で再ソート
        if len(target_uids) > FIRESTORE_IN_LIMIT:
            all_posts.sort(key=lambda p: p.get("timestamp", ""), reverse=True)

        # tab フィールドでフィルタ（未設定の旧データは "solo" 扱い）
        target_tab = "friends" if includeFriends else "solo"
        all_posts = [p for p in all_posts if p.get("tab", "solo") == target_tab]

        return all_posts

    return await loop.run_in_executor(None, fetch)
