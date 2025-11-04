from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
# from google.cloud import firestore
from datetime import datetime, timezone
import asyncio
from dotenv import load_dotenv 
import os
import json

# --- ★実績変更点1: 共通の道具箱からインポート ---
from dependencies import db, get_current_user

# --- ★実績変更点2: 競合を避けるため、ルーターをインポート ---
from routers import achievements

# --- ★実績変更点3: Firestoreの初期化を行う部分をコメントアウト ---
# --- 変更点1: firebase_admin関連のインポートを追加 ---
#import firebase_admin
#from firebase_admin import credentials as admin_credentials, auth
#from firebase_admin import firestore as admin_firestore

# gemini_utils.pyからAI関数をインポート
from gemini_utils import (
    validate_post_safety,
    judge_post_positivity,
    predict_post_reactions,
    generate_reaction_comments_bulk
)

app = FastAPI()
load_dotenv()

# --- CORSミドルウェアの設定 (変更なし) ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://myfirstfirebase-440d6.web.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---★実績変更点4データベース、認証関連のコードをdependencies.pyに移動したため削除---

# --- Pydanticモデルの定義 ---
class PostCreate(BaseModel):
    #userId: str # フロントからは送るが、バックエンドでは認証情報から取得する方が安全
    content: str
    imageUrl: Optional[str] = None
    replyTo: Optional[str] = None

# --- 変更点3: Profile更新用のモデルを追加 ---
class ProfileUpdate(BaseModel):
    username: str
    iconColor: str
    mode: str

# --- ★実績変更点5: 各ルーターをアプリに「ガッチャンコ」 ---
app.include_router(achievements.router, prefix="/api", tags=["Achievements"])

# --- APIエンドポイントの定義 ---

@app.post("/post")
#async def create_post(payload: PostCreate, user_id: str = Depends(get_current_user)): # 認証を追加
async def create_post(payload: PostCreate, user_id: str = Depends(get_current_user)):
    #user_id = "test_user" # 仮のユーザーID（認証実装後に削除）
    # payload.userId の代わりに認証済みの user_id を使う
    # ... (AI分析とFirestore書き込み処理はほぼ同じ、userIdを引数のuser_idに変更) ...
    
    # ユーザーのモード情報を取得
    loop = asyncio.get_running_loop()
    def get_user_mode():
        user_ref = db.collection("users").document(user_id)
        doc = user_ref.get()
        if doc.exists:
            return doc.to_dict().get("mode", "てんさく")  # デフォルトは「てんさく」
        return "てんさく"  # ユーザー情報がない場合もデフォルトは「てんさく」
    
    user_mode = await loop.run_in_executor(None, get_user_mode)
    
    # 1. AIによる安全性チェック（てんさくモードの時のみ）
    if user_mode == "てんさく":
        is_safe, reason = await validate_post_safety(payload.content)
        if not is_safe:
            # NG理由をデータベースに記録してからエラーを返す
            def write_rejected():
                doc_ref = db.collection("rejected_posts").document()
                doc_ref.set({
                    "userId": user_id,
                    "content": payload.content,
                    "imageUrl": payload.imageUrl,
                    "replyTo": payload.replyTo,
                    "timestamp": datetime.now(timezone.utc),
                    "likes": [],
                    "isSafe": False,
                    "safetyReason": reason,
                })
                return doc_ref.id
            try:
                rejected_id = await loop.run_in_executor(None, write_rejected)
                # 必要であれば rejected_id をログなどに活用可能
            finally:
                pass
            raise HTTPException(status_code=400, detail=f"不適切な投稿です: {reason}")

    # 2. 残りのAI分析を並列実行
    (is_positive, (reply_count, reaction_types)) = await asyncio.gather(
        judge_post_positivity(payload.content),
        predict_post_reactions(payload.content)
    )

    # 3. AIコメントを生成
    generated_comments = await generate_reaction_comments_bulk(payload.content, reaction_types)

    # 4. 元のデータとAI分析結果を結合
    new_post_data = {
        "userId": user_id, # ★認証済みのIDを使用
        "content": payload.content,
        "imageUrl": payload.imageUrl,
        "replyTo": payload.replyTo,
        "timestamp": datetime.now(timezone.utc),
        "likes": [],
        "isPositive": is_positive,
        "predictedReplyCount": reply_count,
        "aiComments": generated_comments,
    }
    # ... (Firestore書き込み処理) ...
    loop = asyncio.get_running_loop()
    def write_to_firestore():
        doc_ref = db.collection("posts").document()
        doc_ref.set(new_post_data)
        return doc_ref.id
    post_id = await loop.run_in_executor(None, write_to_firestore)
    return {"message": "投稿完了", "postId": post_id}


@app.post("/like/{post_id}")
async def toggle_like(post_id: str, user_id: str = Depends(get_current_user)): # 認証を追加
    # body.get("userId") の代わりに認証済みの user_id を使う
    loop = asyncio.get_running_loop()
    def toggle():
        post_ref = db.collection("posts").document(post_id)
        doc = post_ref.get()
        if not doc.exists: return None
        data = doc.to_dict() or {}
        likes = data.get("likes", [])
        if user_id in likes:
            post_ref.update({"likes": admin_firestore.ArrayRemove([user_id])})
        else:
            post_ref.update({"likes": admin_firestore.ArrayUnion([user_id])})
        return post_ref.get().to_dict().get("likes", [])
    new_likes = await loop.run_in_executor(None, toggle)
    if new_likes is None:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    return {"message": "いいね更新", "likes": new_likes}


@app.get("/replies/{post_id}")
async def get_replies(post_id: str): # リプライ取得は認証不要の場合が多い
    loop = asyncio.get_running_loop()
    def fetch():
        docs = db.collection("posts").where("replyTo", "==", post_id).order_by("timestamp").stream()
        replies_list = []
        for doc in docs:
            reply_data = doc.to_dict()
            reply_data["id"] = doc.id
            
            # ユーザー情報を取得して投稿データに追加
            user_id = reply_data.get("userId")
            if user_id:
                try:
                    user_ref = db.collection("users").document(user_id)
                    user_doc = user_ref.get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        reply_data["user"] = {
                            "username": user_data.get("username", "ユーザー名"),
                            "iconColor": user_data.get("iconColor", "blue")
                        }
                    else:
                        reply_data["user"] = {
                            "username": "ユーザー名",
                            "iconColor": "blue"
                        }
                except Exception as e:
                    print(f"⚠️ ユーザー情報取得エラー (userId={user_id}): {e}")
                    reply_data["user"] = {
                        "username": "ユーザー名",
                        "iconColor": "blue"
                    }
            else:
                reply_data["user"] = {
                    "username": "ユーザー名",
                    "iconColor": "blue"
                }
            
            replies_list.append(reply_data)
        return replies_list
    results = await loop.run_in_executor(None, fetch)
    return results


@app.get("/posts")
async def get_posts(user_id: str = Depends(get_current_user)): # ログインユーザーの投稿のみ取得
    loop = asyncio.get_running_loop()
    def fetch():
        docs = db.collection("posts").where("replyTo", "==", None).where("userId", "==", user_id).order_by("timestamp", direction=admin_firestore.Query.DESCENDING).stream()
        # ユーザー情報を付与する
        posts_list = []
        for doc in docs:
            post_data = doc.to_dict()
            post_data["id"] = doc.id
            
            # ユーザー情報を取得して投稿データに追加
            user_id_from_post = post_data.get("userId")
            if user_id_from_post:
                try:
                    user_ref = db.collection("users").document(user_id_from_post)
                    user_doc = user_ref.get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        post_data["user"] = {
                            "username": user_data.get("username", "ユーザー名"),
                            "iconColor": user_data.get("iconColor", "blue")
                        }
                    else:
                        # ユーザー情報が見つからない場合はデフォルト値
                        post_data["user"] = {
                            "username": "ユーザー名",
                            "iconColor": "blue"
                        }
                except Exception as e:
                    print(f"⚠️ ユーザー情報取得エラー (userId={user_id_from_post}): {e}")
                    post_data["user"] = {
                        "username": "ユーザー名",
                        "iconColor": "blue"
                    }
            else:
                post_data["user"] = {
                    "username": "ユーザー名",
                    "iconColor": "blue"
                }
            
            posts_list.append(post_data)
        return posts_list
    results = await loop.run_in_executor(None, fetch)
    return results


# --- 変更点4: プロフィール取得APIを追加 ---
@app.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    """ログインユーザーのプロフィールを取得"""
    loop = asyncio.get_running_loop()
    def fetch_user_profile():
        user_ref = db.collection("users").document(user_id)
        doc = user_ref.get()
        if doc.exists:
            return doc.to_dict()
        else:
            # プロフィールがまだ作成されていない場合、デフォルト値を返すかエラーにする
            return {"username": "新しいユーザー", "iconColor": "blue", "mode": "てんさく"} # 例
    profile_data = await loop.run_in_executor(None, fetch_user_profile)
    if profile_data is None:
         raise HTTPException(status_code=404, detail="User profile not found")
    return profile_data


# --- 変更点5: プロフィール更新APIを追加 ---
@app.put("/profile")
async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
    """ログインユーザーのプロフィールを更新"""
    loop = asyncio.get_running_loop()
    profile_data = payload.dict()

    def write_user_profile():
        user_ref = db.collection("users").document(user_id)
        # set(..., merge=True) を使うと、指定したフィールドだけ更新できる
        user_ref.set(profile_data, merge=True)
        return user_ref.get().to_dict() # 更新後のデータを返す

    updated_profile = await loop.run_in_executor(None, write_user_profile)
    return {"message": "プロフィール更新成功", "profile": updated_profile}

