###

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv 
#fastapiライブラリから導入
from functions.config.firebase import init_firebase

from functions.routers import posts, likes, replies, profile, achievement, post_create
from functions.auth.dependencies import get_current_user
from functions.utils.predicted_likes import sample_viral_predicted_likes

#from自分のファイル名　import関数名
#configフォルダ内のfirebase.pyからinit_firebase関数をインポート

load_dotenv()

app = FastAPI()
#FastAPIインスタンスを作成
init_firebase()
#Firebase初期化関数を実行


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "https://myfirstfirebase-440d6.web.app",
    "https://ng-2502testesu.onrender.com"
    ]   ,
    allow_credentials=True,#認証機能を許可
    allow_methods=["*"],    #すべてのHTTPメソッドを許可
    allow_headers=["*"],    #すべてのHTTPヘッダーを許可
)
#CORSミドルウェアを追加し、指定されたオリジンからのリクエストを許可

app.include_router(posts.router)
app.include_router(likes.router)
app.include_router(replies.router)
app.include_router(profile.router)
app.include_router(achievement.router)
app.include_router(post_create.router)
#FastAPI の include_router() は APIRouter 型のオブジェクトを受け取る関数。


from pydantic import BaseModel
from functions.models.post import PostCreate
from typing import Optional, List
# from google.cloud import firestore
from datetime import datetime, timezone
import random  
import asyncio

import os
import json

# --- 変更点1: firebase_admin関連のインポートを追加 ---
import firebase_admin
from firebase_admin import credentials as admin_credentials, auth
from firebase_admin import firestore as admin_firestore

# gemini_utils.pyからAI関数をインポート
from functions.gemini_utils import (
    validate_and_analyze_post,  # 統合版の新関数
    predict_viral,
    generate_controversial_comments,
    generate_viral_comments,
    gemini_model,
    sanitize_ai_output,
)


# --- APIエンドポイントの定義 ---

#投稿作成AIコメント追加データベース保存
# @app.post("/post")
# async def create_post(payload: PostCreate, user_id: str = Depends(get_current_user)):
#     # ユーザーのモード情報を取得
#     loop = asyncio.get_running_loop()
#     def get_user_mode():
#         user_ref = db.collection("users").document(user_id)
#         doc = user_ref.get()
#         if doc.exists:
#             return doc.to_dict().get("mode", "てんさく")
#         return "てんさく"
    
#     user_mode = await loop.run_in_executor(None, get_user_mode)
    
#     # ★★★ 1回のAPI呼び出しで安全性チェックと包括的分析を実行 ★★★
#     is_tensai_mode = (user_mode == "てんさく")
#     analysis = await validate_and_analyze_post(payload.content, require_safety_check=is_tensai_mode)
    
#     # てんさくモードで安全でない場合は投稿を拒否
#     if is_tensai_mode and not analysis["is_safe"]:
#         # NG理由をデータベースに記録してからエラーを返す
#         def write_rejected():
#             doc_ref = db.collection("rejected_posts").document()
#             doc_ref.set({
#                 "userId": user_id,
#                 "content": payload.content,
#                 "imageUrl": payload.imageUrl,
#                 "replyTo": payload.replyTo,
#                 "timestamp": datetime.now(timezone.utc),
#                 "likes": [],
#                 "isSafe": False,
#                 "safetyReason": analysis["safety_reason"],
#             })
#             return doc_ref.id
#         try:
#             rejected_id = await loop.run_in_executor(None, write_rejected)
#         finally:
#             pass
#         # フロントエンドのNgReasonモーダルに表示するためにエラーを返す
#         raise HTTPException(status_code=400, detail=f"不適切な投稿です: {analysis['safety_reason']}")
    
#     # 分析結果を取得
#     is_positive = analysis["is_positive"]
#     reply_count = analysis["reply_count"]
#     reaction_types = analysis["reaction_types"]
#     predicted_likes = analysis["predicted_likes"]
#     is_controversial = analysis["is_controversial"]
    
#     # バズり判定（ポジティブな投稿のみ対象、約5%の確率）
#     is_viral = False
#     if is_positive and not is_controversial:
#         is_viral = await predict_viral(payload.content, is_positive)
#         if is_viral:
#             predicted_likes = sample_viral_predicted_likes()
    
#     # ★★★ AIコメントを1回のAPI呼び出しで生成 ★★★
#     if is_controversial:
#         # 炎上時：炎上コメント12件を1回で生成
#         generated_comments = await generate_controversial_comments(payload.content, count=12)
#     elif is_viral:
#         # バズり時：バズりコメント18件を1回で生成
#         generated_comments = await generate_viral_comments(payload.content, count=18)
#     else:
#         # 通常時：通常コメント + リンクコメント を1回で統合生成
#         total_normal = len(reaction_types) + 2
        
#         # 1回のAPI呼び出しで全てのコメントを生成
#         if gemini_model:
#             # reaction_typesに基づいたコメントタイプのリストを作成
#             comment_types_description = []
#             for r_type in reaction_types:
#                 if r_type == "positive":
#                     comment_types_description.append("前向きなコメント")
#                 elif r_type == "neutral":
#                     comment_types_description.append("中立的なコメント")
#                 elif r_type == "negative":
#                     comment_types_description.append("否定的なコメント")
            
#             comment_types_description.append("怪しいリンク付きコメント（URL: https://myfirstfirebase-440d6.web.app/spam を含む）")
#             comment_types_description.append("あおりコメント")
            
#             unified_prompt = f"""
# あなたは小学生のSNSユーザーです。
# 以下の投稿に対して、{total_normal}件のコメントを生成してください。

# 投稿: "{payload.content}"

# コメントの内訳:
# {chr(10).join([f"{i+1}. {desc}" for i, desc in enumerate(comment_types_description)])}

# ルール:
# - 各コメントはひらがな・カタカナ・簡単な漢字のみ
# - 各コメントは40文字以内
# - 各コメントに絵文字を1つ使う
# - 小学生にも読めるやさしい言葉
# - 前向きなコメント=明るい内容、中立的なコメント=普通の反応、否定的なコメント=批判的
# - 怪しいリンク付きコメントには必ずURL「https://myfirstfirebase-440d6.web.app/spam」を文中に自然に含める
# - あおりコメントは煽るような内容

# 出力形式（各コメントを改行で区切る、コメント本文だけ、{total_normal}件生成）:
# コメント1
# コメント2
# コメント3
# ...
# """
#             try:
#                 response = await gemini_model.generate_content_async(unified_prompt)
#                 comment_text = sanitize_ai_output(response.text.strip())
#                 comments_list = [c.strip() for c in comment_text.split('\n') if c.strip()]
                
#                 # URLをaタグに変換
#                 import re
#                 def url_to_link(comment: str) -> str:
#                     return re.sub(
#                         r'(https?://[^\s]+)',
#                         r'<a href="\1" target="_blank" rel="noopener noreferrer">\1</a>',
#                         comment
#                     )
                
#                 generated_comments = [url_to_link(c) for c in comments_list]
                
#                 # 生成数が足りない場合はデフォルトで補完
#                 while len(generated_comments) < total_normal:
#                     generated_comments.append("いいね！😄")
                
#                 # 生成数が多すぎる場合は切り詰め
#                 generated_comments = generated_comments[:total_normal]
                
#             except Exception as e:
#                 print(f"統合コメント生成エラー: {e}")
#                 generated_comments = ["いいね！😄" for _ in range(total_normal)]
#         else:
#             generated_comments = ["いいね！😄" for _ in range(total_normal)]

#     # 元のデータとAI分析結果を結合
#     new_post_data = {
#         "userId": user_id,
#         "content": payload.content,
#         "imageUrl": payload.imageUrl,
#         "replyTo": payload.replyTo,
#         "timestamp": datetime.now(timezone.utc),
#         "likes": [],
#         "isPositive": is_positive,
#         "predictedReplyCount": reply_count,
#         "predictedLikes": predicted_likes,
#         "isControversial": is_controversial,
#         "isViral": is_viral,
#         "aiComments": generated_comments,
#     }
    
#     # Firestore書き込み処理
#     def write_to_firestore():
#         doc_ref = db.collection("posts").document()
#         doc_ref.set(new_post_data)
#         return doc_ref.id
    
#     post_id = await loop.run_in_executor(None, write_to_firestore)
    
#     # 投稿完了後に投稿数をカウントして実績を更新
#     post_count = await loop.run_in_executor(None, lambda: count_user_posts(user_id))
#     await loop.run_in_executor(None, lambda: update_achievements(user_id, post_count))
    
#     return {"message": "投稿完了", "postId": post_id}

