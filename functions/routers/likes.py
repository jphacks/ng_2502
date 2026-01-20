# routers/posts.py
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore, firestore as admin_firestore
from functions.auth.dependencies import get_current_user
import functions.config.firebase as firebase
router = APIRouter()

# いいねの on/off 切り替え
@router.post("/like/{post_id}")
async def toggle_like(post_id: str, user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def toggle():
        post_ref = firebase.db.collection("posts").document(post_id)
        doc = post_ref.get()

        if not doc.exists:
            return None

        data = doc.to_dict() or {}
        likes = data.get("likes", [])

        # すでにいいねしている → 取り消し
        if user_id in likes:
            post_ref.update({"likes": admin_firestore.ArrayRemove([user_id])})
        else:
            # いいねしていない → 追加
            post_ref.update({"likes": admin_firestore.ArrayUnion([user_id])})

        # 更新後の likes を返す
        return post_ref.get().to_dict().get("likes", [])

    new_likes = await loop.run_in_executor(None, toggle)

    if new_likes is None:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")

    return {"message": "いいね更新", "likes": new_likes}