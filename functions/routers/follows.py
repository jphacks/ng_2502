import asyncio
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore as admin_firestore

from auth.dependencies import get_current_user
from models.follow import FollowCreate
import config.firebase as firebase

router = APIRouter()


@router.post("/follow")
async def follow_user(payload: FollowCreate, user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def execute_follow():
        target_user_id = (payload.targetUserID or "").strip().upper()
        if not target_user_id:
            raise HTTPException(status_code=400, detail="targetUserIDは必須です")

        my_ref = firebase.db.collection("users").document(user_id)
        my_doc = my_ref.get()
        if not my_doc.exists:
            raise HTTPException(status_code=404, detail="自分のプロフィールが見つかりません")

        my_profile = my_doc.to_dict() or {}
        my_user_id = my_profile.get("userID")
        if not my_user_id:
            raise HTTPException(status_code=400, detail="自分のuserIDが未設定です")

        target_query = (
            firebase.db.collection("users")
            .where("userID", "==", target_user_id)
            .limit(1)
            .stream()
        )
        target_docs = list(target_query)
        if not target_docs:
            raise HTTPException(status_code=404, detail="指定されたuserIDが存在しません")

        target_doc = target_docs[0]
        target_uid = target_doc.id
        target_profile = target_doc.to_dict() or {}

        if target_uid == user_id:
            raise HTTPException(status_code=400, detail="自分自身はフォローできません")

        my_ref.update(
            {
                "followingUids": admin_firestore.ArrayUnion([target_uid]),
                "followingUserIDs": admin_firestore.ArrayUnion([target_user_id]),
            }
        )

        target_ref = firebase.db.collection("users").document(target_uid)
        target_ref.update(
            {
                "followerUids": admin_firestore.ArrayUnion([user_id]),
                "followerUserIDs": admin_firestore.ArrayUnion([my_user_id]),
            }
        )

        return {
            "targetUid": target_uid,
            "targetUserID": target_user_id,
            "targetUsername": target_profile.get("username", "ユーザー名"),
        }

    result = await loop.run_in_executor(None, execute_follow)
    return {"message": "フォローしました", "follow": result}


@router.get("/follows")
async def get_follow_lists(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch_lists():
        user_ref = firebase.db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="プロフィールが見つかりません")

        profile = user_doc.to_dict() or {}
        return {
            "userID": profile.get("userID"),
            "followingUids": profile.get("followingUids", []),
            "followingUserIDs": profile.get("followingUserIDs", []),
            "followerUids": profile.get("followerUids", []),
            "followerUserIDs": profile.get("followerUserIDs", []),
        }

    result = await loop.run_in_executor(None, fetch_lists)
    return result


@router.get("/posts/followers")
async def get_followers_posts(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def chunked(items, size):
        for i in range(0, len(items), size):
            yield items[i:i + size]

    def fetch_posts():
        user_ref = firebase.db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return []

        profile = user_doc.to_dict() or {}
        follower_uids = profile.get("followerUids", [])
        relation_uids = list(set([user_id] + follower_uids))

        posts = []
        for uid_chunk in chunked(relation_uids, 10):
            docs = (
                firebase.db.collection("posts")
                .where("replyTo", "==", None)
                .where("isToFollower", "==", True)
                .where("userId", "in", uid_chunk)
                .stream()
            )

            for doc in docs:
                post_data = doc.to_dict() or {}
                post_data["id"] = doc.id
                post_data["predictedLikes"] = post_data.get("predictedLikes", 0)

                author_uid = post_data.get("userId")
                if author_uid:
                    author_doc = firebase.db.collection("users").document(author_uid).get()
                    if author_doc.exists:
                        author = author_doc.to_dict() or {}
                        post_data["user"] = {
                            "username": author.get("username", "ユーザー名"),
                            "iconColor": author.get("iconColor", "blue"),
                        }
                    else:
                        post_data["user"] = {"username": "ユーザー名", "iconColor": "blue"}
                else:
                    post_data["user"] = {"username": "ユーザー名", "iconColor": "blue"}

                posts.append(post_data)

        def sort_key(post):
            ts = post.get("timestamp")
            if ts is None:
                return 0
            if hasattr(ts, "timestamp"):
                try:
                    return ts.timestamp()
                except Exception:
                    return 0
            return 0

        posts.sort(key=sort_key, reverse=True)
        return posts

    result = await loop.run_in_executor(None, fetch_posts)
    return result
