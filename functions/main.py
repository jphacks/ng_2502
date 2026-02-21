from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
# from google.cloud import firestore
from datetime import datetime, timezone
import random  
import asyncio
from dotenv import load_dotenv 
import os
import json
import dm

# --- 変更点1: firebase_admin関連のインポートを追加 ---
import firebase_admin
from firebase_admin import credentials as admin_credentials, auth
from firebase_admin import firestore as admin_firestore

# gemini_utils.pyからAI関数をインポート
from gemini_utils import (
    validate_and_analyze_post,  # 統合版の新関数
    predict_viral,
    generate_controversial_comments,
    generate_viral_comments,
    gemini_model,
    sanitize_ai_output,
)

app = FastAPI()
load_dotenv()

app.include_router(dm.router)

# --- CORSミドルウェアの設定 (変更なし) ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://myfirstfirebase-440d6.web.app",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Firebase Admin SDKの初期化とFirestoreクライアント ---
cred = None
try:
    # ローカル開発用にサービスアカウントキーファイルを試す
    cred = admin_credentials.Certificate("serviceAccountKey.json")
except FileNotFoundError:
    # 本番環境用に環境変数から読み込む (Renderなどで設定)
    cred_json_str = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if cred_json_str:
        cred_info = json.loads(cred_json_str)
        cred = admin_credentials.Certificate(cred_info)
    else:
        print("⚠️ サービスアカウントキーが見つかりません。エミュレータモードのみ動作します。")

# credが見つかった場合のみFirebase Adminを初期化
if cred:
    try:
        firebase_admin.initialize_app(cred)
    except ValueError as e:
        # すでに初期化されている場合は無視
        if "already exists" not in str(e):
            raise e
else:
     # エミュレータ使用時など、credがない場合でも初期化を試みる（一部機能は制限される）
     try:
        firebase_admin.initialize_app()
     except ValueError as e:
        if "already exists" not in str(e):
            raise e


# Firestoreクライアントの初期化 (エミュレータ/本番切り替え)
if os.getenv("FIRESTORE_EMULATOR_HOST"):
    print("🔥 Firestore Emulator に接続しています")
    db = admin_firestore.Client(project="myfirstfirebase-440d6") # エミュレータの場合はプロジェクトIDが必要なことがある
else:
    print("⚠️ 本番Firestoreに接続しています")
    # 本番環境では credentials は initialize_app で設定済みなので不要
    db = admin_firestore.client()

# --- 変更点2: 認証用の関数を定義 ---
# HTTPBearer スキーマのインスタンスを作成
bearer_scheme = HTTPBearer()

async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """ヘッダーからトークンを取得し、検証してユーザーIDを返す"""
    if cred is None:
        print("❌ Authorization ヘッダーがありません")
        raise HTTPException(status_code=401, detail="Bearer token missing")

    print(f"🔍 受け取ったトークン: {cred.credentials[:30]}...")  # トークンの先頭だけ表示

    try:
        decoded_token = auth.verify_id_token(cred.credentials)
        print(f"✅ トークン検証成功: uid={decoded_token['uid']}")
        return decoded_token['uid']
    except Exception as e:
        print(f"❌ トークン検証失敗: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")


# --- Pydanticモデルの定義 ---
class PostCreate(BaseModel):
    content: str
    imageUrl: Optional[str] = None
    replyTo: Optional[str] = None

# --- 変更点3: Profile更新用のモデルを追加 ---
class ProfileUpdate(BaseModel):
    username: str
    iconColor: str
    mode: str

# バズり時のpredicted_likesをサンプリングする（100〜10000、右裾が薄い分布）
def sample_viral_predicted_likes() -> int:
    """
    100〜10000の範囲で、値が大きいほど確率が小さくなるスキュー分布から整数を返す。
    """
    min_val = 100.0
    max_val = 10000.0
    alpha = 0.95424
    u = random.random()
    denom = 1.0 - u * (1.0 - (min_val / max_val) ** alpha)
    x = min_val / (denom ** (1.0 / alpha))
    if x < min_val:
        x = min_val
    elif x > max_val:
        x = max_val
    return int(x)

# --- APIエンドポイントの定義 ---

#投稿作成AIコメント追加データベース保存
@app.post("/post")
async def create_post(payload: PostCreate, user_id: str = Depends(get_current_user)):
    # ユーザーのモード情報を取得
    loop = asyncio.get_running_loop()
    def get_user_mode():
        user_ref = db.collection("users").document(user_id)
        doc = user_ref.get()
        if doc.exists:
            return doc.to_dict().get("mode", "てんさく")
        return "てんさく"
    
    user_mode = await loop.run_in_executor(None, get_user_mode)
    
    # ★★★ 1回のAPI呼び出しで安全性チェックと包括的分析を実行 ★★★
    is_tensai_mode = (user_mode == "てんさく")
    analysis = await validate_and_analyze_post(payload.content, require_safety_check=is_tensai_mode)
    
    # てんさくモードで安全でない場合は投稿を拒否
    if is_tensai_mode and not analysis["is_safe"]:
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
                "safetyReason": analysis["safety_reason"],
            })
            return doc_ref.id
        try:
            rejected_id = await loop.run_in_executor(None, write_rejected)
        finally:
            pass
        # フロントエンドのNgReasonモーダルに表示するためにエラーを返す
        raise HTTPException(status_code=400, detail=f"不適切な投稿です: {analysis['safety_reason']}")
    
    # 分析結果を取得
    is_positive = analysis["is_positive"]
    reply_count = analysis["reply_count"]
    reaction_types = analysis["reaction_types"]
    predicted_likes = analysis["predicted_likes"]
    is_controversial = analysis["is_controversial"]
    
    # バズり判定（ポジティブな投稿のみ対象、約5%の確率）
    is_viral = False
    if is_positive and not is_controversial:
        is_viral = await predict_viral(payload.content, is_positive)
        if is_viral:
            predicted_likes = sample_viral_predicted_likes()
    
    # ★★★ AIコメントを1回のAPI呼び出しで生成 ★★★
    if is_controversial:
        # 炎上時：炎上コメント12件を1回で生成
        generated_comments = await generate_controversial_comments(payload.content, count=12)
    elif is_viral:
        # バズり時：バズりコメント18件を1回で生成
        generated_comments = await generate_viral_comments(payload.content, count=18)
    else:
        # 通常時：通常コメント + リンクコメント を1回で統合生成
        total_normal = len(reaction_types) + 2
        
        # 1回のAPI呼び出しで全てのコメントを生成
        if gemini_model:
            # reaction_typesに基づいたコメントタイプのリストを作成
            comment_types_description = []
            for r_type in reaction_types:
                if r_type == "positive":
                    comment_types_description.append("前向きなコメント")
                elif r_type == "neutral":
                    comment_types_description.append("中立的なコメント")
                elif r_type == "negative":
                    comment_types_description.append("否定的なコメント")
            
            comment_types_description.append("怪しいリンク付きコメント（URL: https://myfirstfirebase-440d6.web.app/spam を含む）")
            comment_types_description.append("あおりコメント")
            
            unified_prompt = f"""
あなたは小学生のSNSユーザーです。
以下の投稿に対して、{total_normal}件のコメントを生成してください。

投稿: "{payload.content}"

コメントの内訳:
{chr(10).join([f"{i+1}. {desc}" for i, desc in enumerate(comment_types_description)])}

ルール:
- 各コメントはひらがな・カタカナ・簡単な漢字のみ
- 各コメントは40文字以内
- 各コメントに絵文字を1つ使う
- 小学生にも読めるやさしい言葉
- 前向きなコメント=明るい内容、中立的なコメント=普通の反応、否定的なコメント=批判的
- 怪しいリンク付きコメントには必ずURL「https://myfirstfirebase-440d6.web.app/spam」を文中に自然に含める
- あおりコメントは煽るような内容

出力形式（各コメントを改行で区切る、コメント本文だけ、{total_normal}件生成）:
コメント1
コメント2
コメント3
...
"""
            try:
                response = await gemini_model.generate_content_async(unified_prompt)
                comment_text = sanitize_ai_output(response.text.strip())
                comments_list = [c.strip() for c in comment_text.split('\n') if c.strip()]
                
                # URLをaタグに変換
                import re
                def url_to_link(comment: str) -> str:
                    return re.sub(
                        r'(https?://[^\s]+)',
                        r'<a href="\1" target="_blank" rel="noopener noreferrer">\1</a>',
                        comment
                    )
                
                generated_comments = [url_to_link(c) for c in comments_list]
                
                # 生成数が足りない場合はデフォルトで補完
                while len(generated_comments) < total_normal:
                    generated_comments.append("いいね！😄")
                
                # 生成数が多すぎる場合は切り詰め
                generated_comments = generated_comments[:total_normal]
                
            except Exception as e:
                print(f"統合コメント生成エラー: {e}")
                generated_comments = ["いいね！😄" for _ in range(total_normal)]
        else:
            generated_comments = ["いいね！😄" for _ in range(total_normal)]

    # 元のデータとAI分析結果を結合
    new_post_data = {
        "userId": user_id,
        "content": payload.content,
        "imageUrl": payload.imageUrl,
        "replyTo": payload.replyTo,
        "timestamp": datetime.now(timezone.utc),
        "likes": [],
        "isPositive": is_positive,
        "predictedReplyCount": reply_count,
        "predictedLikes": predicted_likes,
        "isControversial": is_controversial,
        "isViral": is_viral,
        "aiComments": generated_comments,
    }
    
    # Firestore書き込み処理
    def write_to_firestore():
        doc_ref = db.collection("posts").document()
        doc_ref.set(new_post_data)
        return doc_ref.id
    
    post_id = await loop.run_in_executor(None, write_to_firestore)
    
    # 投稿完了後に投稿数をカウントして実績を更新
    post_count = await loop.run_in_executor(None, lambda: count_user_posts(user_id))
    await loop.run_in_executor(None, lambda: update_achievements(user_id, post_count))
    
    return {"message": "投稿完了", "postId": post_id}


#いいねのon/off切り替え
@app.post("/like/{post_id}")
async def toggle_like(post_id: str, user_id: str = Depends(get_current_user)):
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


#リプライ取得
@app.get("/replies/{post_id}")
async def get_replies(post_id: str):
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


#投稿一覧取得
@app.get("/posts")
async def get_posts(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()
    def fetch():
        docs = db.collection("posts").where("replyTo", "==", None).where("userId", "==", user_id).order_by("timestamp", direction=admin_firestore.Query.DESCENDING).stream()
        posts_list = []
        for doc in docs:
            post_data = doc.to_dict()
            post_data["id"] = doc.id
            post_data["predictedLikes"] = post_data.get("predictedLikes", 0)
            
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


# --- プロフィール取得API ---
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
            return {"username": "新しいユーザー", "iconColor": "blue", "mode": "てんさく"}
    profile_data = await loop.run_in_executor(None, fetch_user_profile)
    if profile_data is None:
         raise HTTPException(status_code=404, detail="User profile not found")
    return profile_data


# --- プロフィール更新API ---
@app.put("/profile")
async def update_profile(payload: ProfileUpdate, user_id: str = Depends(get_current_user)):
    """ログインユーザーのプロフィールを更新"""
    loop = asyncio.get_running_loop()
    profile_data = payload.dict()

    def write_user_profile():
        user_ref = db.collection("users").document(user_id)
        user_ref.set(profile_data, merge=True)
        return user_ref.get().to_dict()

    updated_profile = await loop.run_in_executor(None, write_user_profile)
    return {"message": "プロフィール更新成功", "profile": updated_profile}


# --- 実績関連の関数 ---
ALL_ACHIEVEMENTS = {
    "post_10",
    "post_30",
    "fired_1",
    "like_total_100",
    "reply_total_20",
    "positive_20",
}

def count_user_posts(user_id: str):
    docs = db.collection("posts").where("userId", "==", user_id).stream()
    return sum(1 for _ in docs)

def update_achievements(user_id: str, post_count: int):
    achievement_ref = db.collection("achievements").document(user_id)
    doc = achievement_ref.get()
    existing = doc.to_dict().get("unlocked", []) if doc.exists else []
    achievements = set(existing)

    if post_count >= 10:
        achievements.add("post_10")

    if post_count >= 30:#あとで数字変える
        achievements.add("post_30")

    total_likes = count_total_predicted_likes(user_id)
    if total_likes >= 100:
        achievements.add("like_total_100")

    total_replies = count_total_predicted_replies(user_id)
    if total_replies >= 20:
        achievements.add("reply_total_20")

    positive_posts = count_positive_posts(user_id)
    if positive_posts >= 20:#あとで数字変える
        achievements.add("positive_20")  # ← ここ！
    
    controversial_posts = count_controversial_posts(user_id)
    if controversial_posts >= 1:
        achievements.add("fired_1")

    if ALL_ACHIEVEMENTS.issubset(achievements):
        achievements.add("all_achievements_unlocked")

    achievement_ref.set({"unlocked": list(achievements)}, merge=True)

def count_controversial_posts(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).where("isControversial", "==", True).stream()
    return sum(1 for _ in docs)

def count_total_predicted_likes(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).stream()
    return sum(doc.to_dict().get("predictedLikes", 0) for doc in docs)

def count_total_predicted_replies(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).stream()
    return sum(doc.to_dict().get("predictedReplyCount", 0) for doc in docs)

def count_positive_posts(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).where("isPositive", "==", True).stream()
    return sum(1 for _ in docs)

@app.get("/achievements")
async def get_achievements(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()
    def fetch():
        doc = db.collection("achievements").document(user_id).get()
        return doc.to_dict().get("unlocked", []) if doc.exists else []
    unlocked = await loop.run_in_executor(None, fetch)
    return {"achievements": unlocked}