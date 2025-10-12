import os
import google.generativeai as genai

# --- 初期化 ---
# 環境変数からAPIキーを読み込み、Geminiモデルを初期化します。
# このファイルが import された際に一度だけ実行されます。
try:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("環境変数 'GEMINI_API_KEY' が設定されていません。")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    print(f"Geminiモデルの初期化に失敗しました: {e}")
    gemini_model = None

# --- 関数定義 ---

async def validate_post_safety(text: str) -> tuple[bool, str]:
    """
    投稿が子供向けSNSとして安全かどうかを検証します。

    Args:
        text: 検証する投稿の本文。

    Returns:
        tuple[bool, str]: (安全か, 不適切な場合の理由)
    """
    if not gemini_model:
        return False, "AIモデルが初期化されていません。"

    prompt = f"""
        あなたは、小学生向けSNSの安全性をチェックするAIモデレーターです。
        以下の投稿に、いじめ、暴力的な言葉、個人情報、その他子供に不適切な内容が含まれているか判定してください。

        ルール:
        - 問題がなければ、必ず「OK」とだけ返答してください。
        - 問題がある場合は、必ず「NG」と返答し、その後に子供にも分かるように簡単な理由を続けてください。
        （例: NG いじわるな言葉は使わないようにしようね）

        ---
        投稿: "{text}"
        ---
        判定:
    """
    try:
        response = await gemini_model.generate_content_async(prompt)
        result_text = response.text.strip()
        
        if result_text.startswith("OK"):
            return True, ""  # 安全
        else:
            reason = result_text.replace("NG", "").strip()
            return False, reason if reason else "不適切な内容が含まれています。"
            
    except Exception as e:
        print(f"Gemini API (validate_post_safety) error: {e}")
        # 安全のため、エラー時は不適切と判断します。
        return False, "コンテンツのチェック中にエラーが発生しました。"


async def generate_ai_comment(text: str) -> str:
    """
    投稿に対して、AIが友達のようなフレンドリーなコメントを生成します。

    Args:
        text: AIがコメントする対象の投稿本文。

    Returns:
        str: 生成されたコメント文字列。
    """
    if not gemini_model:
        return "素敵な投稿だね！"

    prompt = f"あなたは小学生の友達です。以下の投稿に対して、30文字以内で絵文字を1つか2つ使った、元気で短いコメントを返してください。\n\n投稿: 「{text}」"
    
    try:
        response = await gemini_model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API (generate_ai_comment) error: {e}")
        # エラー時も代替コメントを返します。
        return "すごい！面白いね！😄"


async def judge_post_positivity(text: str) -> bool:
    """
    投稿がポジティブな内容かどうかを判定します。（AIの「いいね」判断用）

    Args:
        text: 判定する投稿の本文。

    Returns:
        bool: ポジティブであればTrue、そうでなければFalse。
    """
    if not gemini_model:
        return False

    prompt = f"以下の投稿は、読んだ人が明るくポジティブな気持ちになる内容ですか？必ず「Yes」か「No」だけで答えてください。\n\n投稿: 「{text}」"
    
    try:
        response = await gemini_model.generate_content_async(prompt)
        # 応答に "yes" (小文字) が含まれていればポジティブと判断します。
        return "yes" in response.text.lower()
    except Exception as e:
        print(f"Gemini API (judge_post_positivity) error: {e}")
        # エラー時はポジティブではないと判断します。
        return False
    