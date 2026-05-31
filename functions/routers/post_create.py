import asyncio
from datetime import datetime, timezone
import random

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore as admin_firestore

from functions.auth.dependencies import get_current_user
from functions.models.post import PostCreate
from functions.utils.achievements import count_user_posts, update_achievements
import functions.config.firebase as firebase
from functions.utils.predicted_likes import sample_viral_predicted_likes
from functions.gemini_utils import (
    validate_and_analyze_post,
    validate_and_analyze_post_with_image,
    predict_viral,
    generate_controversial_comments,
    generate_viral_comments,
    gemini_model,
    sanitize_ai_output,
)

router = APIRouter()

# ★ ランダムAIキャラ名
AI_NAMES = [
    "あい", "じぇみー", "ぐー", "ちゃぴ", "こぱ",
    "ロット", "りあ", "ふぁいあ", "アラン", "くら",
    "かに", "くじら", "ほっけ", "たこ", "さけ",
    "たい", "ぺんぎん", "いるか", "あざらし",
    "カジキ", "チュナ", "ぱくぱく", "もぐ"
]

# ★ ランダムアイコンカラー
AI_COLORS = ["purple", "blue", "green", "pink", "orange"]


@router.post("/post")
async def create_post(payload: PostCreate, user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    # --- ユーザーモード取得 ---
    def get_user_mode():
        user_ref = firebase.db.collection("users").document(user_id)
        doc = user_ref.get()
        if doc.exists:
            return doc.to_dict().get("mode", "てんさく")
        return "てんさく"

    user_mode = await loop.run_in_executor(None, get_user_mode)
    is_tensai_mode = (user_mode == "てんさく")

    # --- 安全性チェック + 分析 ---
    if payload.imageUrl:
        analysis = await validate_and_analyze_post_with_image(
            payload.content,
            payload.imageUrl,
            require_safety_check=is_tensai_mode
        )
    else:
        analysis = await validate_and_analyze_post(payload.content, require_safety_check=is_tensai_mode)

    if is_tensai_mode and not analysis["is_safe"]:
        # 不適切投稿の保存
        def write_rejected():
            doc_ref = firebase.db.collection("rejected_posts").document()
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

        await loop.run_in_executor(None, write_rejected)
        raise HTTPException(status_code=400, detail=f"不適切な投稿です: {analysis['safety_reason']}")

    # --- 分析結果 ---
    is_positive = analysis["is_positive"]
    reply_count = analysis["reply_count"]
    reaction_types = analysis["reaction_types"]
    predicted_likes = analysis["predicted_likes"]
    is_controversial = analysis["is_controversial"]

    # --- バズ判定 ---
    is_viral = False
    if is_positive and not is_controversial:
        is_viral = await predict_viral(payload.content, is_positive)
        if is_viral:
            predicted_likes = sample_viral_predicted_likes()

    # --- AIコメント生成 ---
    if is_controversial:
        generated_comments = await generate_controversial_comments(payload.content, count=12)
    elif is_viral:
        generated_comments = await generate_viral_comments(payload.content, count=18)
    else:
        total_normal = len(reaction_types) + 2

        if gemini_model:
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
- 怪しいリンク付きコメントには必ずURL「https://myfirstfirebase-440d6.web.app/spam」を含める
- あおりコメントは煽る内容

出力形式（{total_normal}件、本文のみ、改行区切り）:
"""

            try:
                response = await gemini_model.generate_content_async(unified_prompt)
                comment_text = sanitize_ai_output(response.text.strip())
                comments_list = [c.strip() for c in comment_text.split("\n") if c.strip()]
                generated_comments = comments_list[:total_normal]
                while len(generated_comments) < total_normal:
                    generated_comments.append("いいね！😄")
            except:
                generated_comments = ["いいね！😄" for _ in range(total_normal)]
        else:
            generated_comments = ["いいね！😄" for _ in range(total_normal)]

    # --- 親投稿データ（aiComments は空にする） ---
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
        "aiComments": [],  # ← ここ重要
    }

    # --- Firestore 書き込み（親投稿） ---
    def write_parent():
        doc_ref = firebase.db.collection("posts").document()
        doc_ref.set(new_post_data)
        return doc_ref.id

    post_id = await loop.run_in_executor(None, write_parent)

    # --- AIコメントを独立ドキュメントとして保存 ---
    def write_ai_replies():
        batch = firebase.db.batch()
        posts_ref = firebase.db.collection("posts")

        for comment in generated_comments:
            ai_name = random.choice(AI_NAMES)
            ai_color = random.choice(AI_COLORS)

            reply_ref = posts_ref.document()
            batch.set(reply_ref, {
                "userId": f"ai-system-{user_id}",
                "user": {
                    "username": ai_name,
                    "iconColor": ai_color,
                },
                "content": comment,
                "imageUrl": None,
                "replyTo": post_id,
                "timestamp": datetime.now(timezone.utc),
                "likes": [],
                "isPositive": False,
                "predictedReplyCount": 0,
                "predictedLikes": 0,
                "isControversial": False,
                "isViral": False,
                "aiComments": [],
                "isAiComment": True,
            })

        batch.commit()

    await loop.run_in_executor(None, write_ai_replies)

    # --- 実績更新 ---
    post_count = await loop.run_in_executor(None, lambda: count_user_posts(user_id))
    await loop.run_in_executor(None, lambda: update_achievements(user_id, post_count))

    return {"message": "投稿完了", "postId": post_id}
