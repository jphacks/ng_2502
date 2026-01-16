# # --- プロフィール更新API ---
# @app.put("/profile")
# async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
#     """ログインユーザーのプロフィールを更新"""
#     loop = asyncio.get_running_loop()
#     profile_data = payload.dict()

#     def write_user_profile():
#         user_ref = db.collection("users").document(user_id)
#         user_ref.set(profile_data, merge=True)
#         return user_ref.get().to_dict()

#     updated_profile = await loop.run_in_executor(None, write_user_profile)
#     return {"message": "プロフィール更新成功", "profile": updated_profile}
# routers/profile.py
# routers/profile.py
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from auth.dependencies import get_current_user
from models.profile import ProfileUpdate  # ← あなたのPydanticモデル
from config.firebase import db

router = APIRouter()

# --- プロフィール取得API ---
@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    """ログインユーザーのプロフィールを取得"""
    loop = asyncio.get_running_loop()

    def fetch_user_profile():
        user_ref = db.collection("users").document(user_id)
        doc = user_ref.get()

        if doc.exists:
            return doc.to_dict()
        else:
            return {
                "username": "新しいユーザー",
                "iconColor": "blue",
                "mode": "てんさく"
            }

    profile_data = await loop.run_in_executor(None, fetch_user_profile)

    if profile_data is None:
        raise HTTPException(status_code=404, detail="User profile not found")

    return profile_data


# --- プロフィール更新API ---
@router.put("/profile")
async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
    """ログインユーザーのプロフィールを更新"""
    loop = asyncio.get_running_loop()
    profile_data = payload.dict()

    def write_user_profile():
        user_ref = db.collection("users").document(user_id)
        user_ref.set(profile_data, merge=True)
        return user_ref.get().to_dict()

    try:
        updated_profile = await loop.run_in_executor(None, write_user_profile)
        return {"message": "プロフィール更新成功", "profile": updated_profile}
    except Exception as e:
        print("プロフィール更新エラー:", e)
        raise HTTPException(status_code=500, detail="プロフィール更新に失敗しました")