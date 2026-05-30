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
from functions.auth.dependencies import get_current_user
from functions.models.profile import ProfileUpdate
from functions.gemini_utils import (validate_comment)
import functions.config.firebase as firebase   # ← ここだけ変更
from pydantic import BaseModel

from passlib.context import CryptContext #パスワードハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

# プロフィール取得API
@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch_user_profile():
        user_ref = firebase.db.collection("users").document(user_id)
        doc = user_ref.get()

        if doc.exists:
            return doc.to_dict()
        else:
            data= {
                "username": "新しいユーザー",
                "comment": "ひとこと",
                "iconColor": "blue",
                "mode": "てんさく"
            }

        data["hasParentPassword"] = "parentPasswordHash" in data
        return data
    profile_data = await loop.run_in_executor(None, fetch_user_profile)
    return profile_data
    

# プロフィール更新API
@router.put("/profile")
async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()
    profile_data = payload.dict(exclude_none=True)

     # コメント取得
    comment = profile_data.get("comment", "")

    def fetch_user():
        user_ref = firebase.db.collection("users").document(user_id)
        doc = user_ref.get()

        if doc.exists:
            return doc.to_dict()

        return {}
    user_data = await loop.run_in_executor(None, fetch_user)

    mode = profile_data.get("mode", "てんさく")

    # AI分析
    analysis_result = await validate_comment(
        comment,
        require_safety_check=(mode == "てんさく")
    )

    # てんさくモードの場合はコメントの安全性チェックを実行
    if mode == "てんさく" and not analysis_result["is_safe"]:
        raise HTTPException(status_code=400, detail= analysis_result['safety_reason'])
    
    # AI分析結果をFirestore保存用データに追加
    profile_data["commentAnalysis"] = {
        "is_safe": analysis_result["is_safe"],
        "safety_reason": analysis_result["safety_reason"],
        "is_positive": analysis_result["is_positive"],
        "is_controversial": analysis_result["is_controversial"]
    }



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

class ParentPassword(BaseModel):
    password: str


@router.post("/profile/parent-password")
async def set_parent_password(payload: ParentPassword, user_id: str = Depends(get_current_user)):

    # 4桁数字チェック
    if not payload.password.isdigit():
        raise HTTPException(
            status_code=400,
            detail="PINは数字のみです"
        )

    if len(payload.password) != 4:
        raise HTTPException(
            status_code=400,
            detail="PINは4桁です"
        )
    
    # デバッグ用ログ
    print(payload.password)
    print(type(payload.password))
    print(len(payload.password))

    hashed = pwd_context.hash(payload.password)

    def write_password():
        user_ref = firebase.db.collection("users").document(user_id)
        user_ref.set({
            "parentPasswordHash": hashed
        }, merge=True)

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, write_password)

    return {"message": "password set"}

class VerifyPassword(BaseModel):
    password: str


@router.post("/profile/verify-parent-password")
async def verify_parent_password(payload: VerifyPassword, user_id: str = Depends(get_current_user)):

    def fetch_password():
        user_ref = firebase.db.collection("users").document(user_id)
        doc = user_ref.get()
        return doc.to_dict().get("parentPasswordHash")

    loop = asyncio.get_running_loop()
    stored_hash = await loop.run_in_executor(None, fetch_password)

    if not stored_hash:
        raise HTTPException(status_code=400, detail="password not set")

    if pwd_context.verify(payload.password, stored_hash):
        return {"success": True}

    raise HTTPException(status_code=401, detail="wrong password")
#パスワードがあるかどうかを返すAPI
@router.get("/profile/has-parent-password")
async def has_parent_password(user_id: str = Depends(get_current_user)):
    user = firebase.db.collection("users").document(user_id)
    doc = user.get()

    return {
        "has_parent_password": bool(doc.get("parentPasswordHash"))
    }

