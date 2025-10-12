from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from google.cloud import firestore
from datetime import datetime, timezone
import asyncio
from dotenv import load_dotenv 
import os

# gemini_utils.pyからAI関数をインポート
from gemini_utils import (
    validate_post_safety,
    judge_post_positivity,
    predict_post_reactions,
    generate_reaction_comments_bulk
)

# --- ★★★ ここで app を定義しています ★★★ ---
app = FastAPI()
# --- ★★★ -------------------------- ★★★ ---

load_dotenv()

# --- CORSミドルウェアの設定 ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Firestoreクライアントの初期化 ---
# 常にエミュレータに接続するように強制
print("🔥 Firestore Emulator に強制接続しています")
db = firestore.Client(project="myfirstfirebase-440d6")


# --- Pydanticモデルの定義 ---
class PostCreate(BaseModel):
    userId: str
    content: str
    imageUrl: Optional[str] = None
    replyTo: Optional[str] = None

# --- APIエンドポイントの定義 ---
@app.post("/post")
async def create_post(payload: PostCreate):
    is_safe, reason = await validate_post_safety(payload.content)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"不適切な投稿です: {reason}")
    (is_positive, (reply_count, reaction_types)) = await asyncio.gather(
        judge_post_positivity(payload.content),
        predict_post_reactions(payload.content)
    )
    generated_comments = await generate_reaction_comments_bulk(payload.content, reaction_types)
    new_post_data = {
        "userId": payload.userId,
        "content": payload.content,
        "imageUrl": payload.imageUrl,
        "replyTo": payload.replyTo,
        "timestamp": datetime.now(timezone.utc),
        "likes": [],
        "isPositive": is_positive,
        "predictedReplyCount": reply_count,
        "aiComments": generated_comments,
    }
    loop = asyncio.get_running_loop()
    def write_to_firestore():
        doc_ref = db.collection("posts").document()
        doc_ref.set(new_post_data)
        return doc_ref.id
    post_id = await loop.run_in_executor(None, write_to_firestore)
    return {"message": "投稿完了", "postId": post_id}

@app.post("/like/{post_id}")
async def toggle_like(post_id: str, body: dict):
    user_id = body.get("userId")
    if not user_id:
        raise HTTPException(status_code=400, detail="userId is required")
    loop = asyncio.get_running_loop()
    def toggle():
        post_ref = db.collection("posts").document(post_id)
        doc = post_ref.get()
        if not doc.exists: return None
        data = doc.to_dict() or {}
        likes = data.get("likes", [])
        if user_id in likes:
            post_ref.update({"likes": firestore.ArrayRemove([user_id])})
        else:
            post_ref.update({"likes": firestore.ArrayUnion([user_id])})
        return post_ref.get().to_dict().get("likes", [])
    new_likes = await loop.run_in_executor(None, toggle)
    if new_likes is None:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    return {"message": "いいね更新", "likes": new_likes}

@app.get("/replies/{post_id}")
async def get_replies(post_id: str):
    loop = asyncio.get_running_loop()
    def fetch():
        docs = db.collection("posts").where("replyTo", "==", post_id).order_by("timestamp").stream()
        return [{"id": d.id, **d.to_dict()} for d in docs]
    results = await loop.run_in_executor(None, fetch)
    return results

@app.get("/posts")
async def get_posts():
    loop = asyncio.get_running_loop()
    def fetch():
        docs = db.collection("posts").where("replyTo", "==", None).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()
        return [{"id": d.id, **d.to_dict()} for d in docs]
    results = await loop.run_in_executor(None, fetch)
    return results
