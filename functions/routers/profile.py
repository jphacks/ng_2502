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
import random
import string
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from functions.auth.dependencies import get_current_user
from functions.models.profile import ProfileUpdate
import functions.config.firebase as firebase

router = APIRouter()


_ANGOU_MAX_RETRIES = 10


def _generate_unique_angou(db) -> str:
    chars = string.ascii_lowercase
    for _ in range(_ANGOU_MAX_RETRIES):
        angou = "".join(random.choices(chars, k=7)) + "@" + "".join(random.choices(chars, k=2))
        exists = list(db.collection("users").where("angou", "==", angou).limit(1).stream())
        if not exists:
            return angou
    raise RuntimeError("あんごうの生成に失敗しました（重複回避の上限に達しました）")


@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch_user_profile():
        user_ref = firebase.db.collection("users").document(user_id)
        doc = user_ref.get()

        if doc.exists:
            data = doc.to_dict()
            # angou が未生成のユーザー（既存ユーザー対応）
            if not data.get("angou"):
                angou = _generate_unique_angou(firebase.db)
                user_ref.update({"angou": angou})
                data["angou"] = angou
            # friends / friendRequests フィールドがなければ初期化
            if "friends" not in data:
                user_ref.update({"friends": [], "friendRequests": []})
        else:
            # 初回アクセス: デフォルトプロフィールを作成
            angou = _generate_unique_angou(firebase.db)
            data = {
                "username": "新しいユーザー",
                "iconColor": "blue",
                "mode": "てんさく",
                "angou": angou,
                "friends": [],
                "friendRequests": [],
            }
            user_ref.set(data)

        data["uid"] = user_id
        return data

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
        updated_profile["uid"] = user_id
        return {"message": "プロフィール更新成功", "profile": updated_profile}
    except Exception as e:
        print("プロフィール更新エラー:", e)
        raise HTTPException(status_code=500, detail="プロフィール更新に失敗しました")