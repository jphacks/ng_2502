import os
from dotenv import load_dotenv
import google.generativeai as genai
import asyncio

# .env読み込み
load_dotenv()

# モデル初期化
try:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("環境変数 'GEMINI_API_KEY' が設定されていません。")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Geminiモデルの初期化に失敗しました: {e}")
    gemini_model = None

# --- 関数定義 ---

async def validate_post_safety(text: str) -> tuple[bool, str]:
    if not gemini_model:
        return False, "AIモデルが初期化されていません。"

    prompt = f"""
あなたは小学生向けSNSの安全性チェックAIです。
以下の投稿に、いじめ、暴力、個人情報、その他子供に不適切な内容が含まれているか判定してください。
問題がなければ「OK」、問題があれば「NG 理由」の形式で答えてください。

投稿: "{text}"
"""
    try:
        response = await gemini_model.generate_content_async(prompt)
        result_text = response.text.strip()
        if result_text.startswith("OK"):
            return True, ""
        else:
            reason = result_text.replace("NG", "").strip()
            return False, reason if reason else "不適切な内容が含まれています。"
    except Exception as e:
        return False, f"エラー: {e}"


async def judge_post_positivity(text: str) -> bool:
    if not gemini_model:
        return False
    prompt = f"""
以下の投稿は読んだ人を明るい気持ちにしますか？
Yes か No だけで答えてください。
投稿: "{text}"
"""
    try:
        response = await gemini_model.generate_content_async(prompt)
        return "yes" in response.text.lower()
    except Exception:
        return False


async def predict_post_reactions(text: str) -> tuple[int, list[str]]:
    """
    投稿に対する反応タイプを安定生成。
    軽量モデル向けに、カンマ区切り形式でタイプを返す。
    """
    if not gemini_model:
        return 3, ["positive", "neutral", "neutral"]

    prompt = f"""
あなたはSNS上のコメント予測AIです。
投稿に対して3〜10件のコメントが付くと想定してください。
コメントタイプは positive / negative / neutral のいずれかです。
投稿: "{text}"
出力例: positive, neutral, positive
"""
    try:
        response = await gemini_model.generate_content_async(prompt)
        text_result = response.text.strip()
        types = [t.strip() for t in text_result.split(",") if t.strip() in ["positive","neutral","negative"]]
        reply_count = len(types) if types else 3
        if not types:
            types = ["positive","neutral","neutral"]
        return reply_count, types
    except Exception:
        return 3, ["positive","neutral","neutral"]


async def generate_reaction_comments_bulk(text: str, reactions: list[str]) -> list[str]:
    """
    軽量モデル向けに、1件ずつコメント生成してリストにまとめる。
    """
    if not gemini_model:
        return ["いいね！😊" for _ in reactions]

    comments = []
    for r_type in reactions:
        prompt = f"""
あなたは小学生のSNSユーザーです。
以下の投稿に対して、1件のコメントを生成してください。
タイプ: {r_type}
ルール:
- ひらがな・カタカナ・簡単な漢字のみ
- 30文字以内
- 絵文字を1つ使う
- 小学生にも読めるやさしい言葉

投稿: "{text}"
"""
        try:
            response = await gemini_model.generate_content_async(prompt)
            comments.append(response.text.strip())
        except Exception:
            comments.append("いいね！😄")
    return comments

async def revise_post_for_safety(original_post: str, ng_reason: str) -> str:
    """
    不適切と判断された投稿を、NG理由に基づいて安全な内容に修正（添削）します。
    """
    if not gemini_model:
        # AIモデルが利用できない場合
        return "エラー: AIモデルが初期化されていません。"

    prompt = f"""
あなたはSNSのコンテンツモデレーターです。
以下の『元の投稿』は、『NG理由』に基づき不適切と判定されました。

元の投稿の意図をできるだけ維持しつつ、『NG理由』で指摘された問題点を修正し、安全で適切な内容の投稿に書き換えてください。

【ルール】
- 修正後の投稿本文のみを出力してください。
- 挨拶、前置き、修正内容の説明は一切不要です。
- 元の投稿の主要な意図は保持してください。
- 投稿は小学生でも理解できる、平易な言葉遣い（ひらがな、カタカナ、簡単な漢字）で記述してください。

【元の投稿】
{original_post}

【NG理由】
{ng_reason}

【修正後の投稿】
"""
    try:
        response = await gemini_model.generate_content_async(prompt)
        revised_post = response.text.strip()
        
        if not revised_post:
            # AIが空の回答を返した場合
            return "エラー: 修正案の生成に失敗しました。元の投稿を確認してください。"
        
        return revised_post
        
    except Exception as e:
        print(f"Error during post revision: {e}")
        # エラーが発生した場合
        return f"エラー: 修正中に予期せぬ問題が発生しました。 ({e})"