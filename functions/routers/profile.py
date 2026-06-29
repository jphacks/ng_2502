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
import secrets
from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_user
from models.profile import ProfileUpdate
import config.firebase as firebase   # ← ここだけ変更

router = APIRouter()


def generate_user_id() -> str:
    # 例: U-1A2B3C4D
    return f"U-{secrets.token_hex(4).upper()}"


def reserve_unique_user_id(user_uid: str, max_retries: int = 10) -> str:
    for _ in range(max_retries):
        candidate = generate_user_id()
        reserve_ref = firebase.db.collection("user_ids").document(candidate)
        try:
            reserve_ref.create({"ownerUid": user_uid})
            return candidate
        except Exception:
            # すでに存在するIDなら再試行
            continue

    raise RuntimeError("unique userID generation failed")

@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch_user_profile():
        user_ref = firebase.db.collection("users").document(user_id)
        doc = user_ref.get()

        if doc.exists:
            profile = doc.to_dict() or {}

            # 既存ユーザーにuserIDが無ければ採番して保存
            if not profile.get("userID"):
                unique_user_id = reserve_unique_user_id(user_id)
                user_ref.set({"userID": unique_user_id}, merge=True)
                profile["userID"] = unique_user_id

            return profile
        else:
            unique_user_id = reserve_unique_user_id(user_id)
            profile = {
                "username": "新しいユーザー",
                "iconColor": "blue",
                "mode": "てんさく",
                "userID": unique_user_id,
            }

            # 初回アクセス時にデフォルトプロフィールを作成
            user_ref.set(profile, merge=True)
            return profile

    profile_data = await loop.run_in_executor(None, fetch_user_profile)

    if profile_data is None:
        raise HTTPException(status_code=404, detail="User profile not found")

    return profile_data


@router.put("/profile")
async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()
    profile_data = payload.dict()

    def write_user_profile():
        user_ref = firebase.db.collection("users").document(user_id)
        user_ref.set(profile_data, merge=True)
        return user_ref.get().to_dict()

    try:
        updated_profile = await loop.run_in_executor(None, write_user_profile)
        return {"message": "プロフィール更新成功", "profile": updated_profile}
    except Exception as e:
        print("プロフィール更新エラー:", e)
        raise HTTPException(status_code=500, detail="プロフィール更新に失敗しました")