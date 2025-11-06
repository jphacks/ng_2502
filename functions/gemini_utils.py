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
問題がなければ「OK」、問題があれば「NG 理由」の形式で答えてください。理由はひらがな、カタカナのみで、簡単な言葉で説明してください。

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
    戻り値: ["コメント文", ...]
    """
    if not gemini_model:
        return ["いいね！😊" for _ in reactions]

    comments: list[str] = []
    for r_type in reactions:
        # コメント生成
        comment_prompt = f"""
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
            response = await gemini_model.generate_content_async(comment_prompt)
            comment_text = response.text.strip()
        except Exception:
            comment_text = "いいね！😄"

        comments.append(comment_text)
    
    return comments


async def predict_post_likes(text: str) -> int:
    """
    ユーザーの投稿に対して、つくと予測される「いいね」の件数を返す。
    0〜100の範囲にクリップして整数で返す。
    失敗時はデフォルト値 3 を返す。
    """
    if not gemini_model:
        return 3

    prompt = f"""
あなたはSNSの反応予測AIです。
以下の投稿に、どれくらいの「いいね」がつくと予測しますか？
0〜100の数字だけで答えてください。
投稿: "{text}"
"""
    try:
        response = await gemini_model.generate_content_async(prompt)
        predicted = int(''.join(filter(str.isdigit, response.text.strip())))
        return max(0, min(100, predicted))
    except Exception:
        return 3


async def predict_controversy(text: str) -> bool:
    """
    投稿が炎上するリスクがあるかを判定する。
    個人情報、攻撃的な内容、センシティブなトピックを検出。
    炎上リスクがある場合は True を返す。
    """
    if not gemini_model:
        return False

    prompt = f"""
あなたはSNS炎上リスク判定AIです。
以下の投稿が炎上する可能性があるか判定してください。

炎上リスクの判定基準:
1. 個人情報（名前、住所、電話番号、学校名など）が含まれている
2. 特定の人物や集団への攻撃的な内容
3. 差別的な表現や偏見を含む内容
4. センシティブなトピック（政治、宗教、人種など）
5. 誤解を招きやすい誇張表現や虚偽の可能性がある内容

投稿: "{text}"

炎上リスクがある場合は「YES」、ない場合は「NO」だけで答えてください。
"""
    try:
        response = await gemini_model.generate_content_async(prompt)
        result = response.text.strip().upper()
        return "YES" in result
    except Exception:
        return False


async def generate_controversial_comments(text: str, count: int = 10) -> list[str]:
    """
    炎上時の厳しいコメントを生成する。
    個人情報が含まれている場合はそれに言及し、批判的な内容を含める。
    """
    if not gemini_model:
        return ["これはダメだよ😠" for _ in range(count)]

    # まず投稿から個人情報を抽出
    extract_prompt = f"""
以下の投稿から、個人を特定できる情報（名前、場所、学校名など）を抽出してください。
見つからない場合は「なし」と答えてください。

投稿: "{text}"
"""
    
    personal_info = "なし"
    try:
        extract_response = await gemini_model.generate_content_async(extract_prompt)
        personal_info = extract_response.text.strip()
    except Exception:
        pass

    comments: list[str] = []
    
    for i in range(count):
        # コメントのバリエーションを作るためにインデックスを利用
        if i < 3 and personal_info != "なし":
            # 個人情報に言及するコメント
            comment_prompt = f"""
あなたは炎上しているSNS投稿にコメントをする人です。
以下の投稿に対して、個人情報が含まれていることを指摘する厳しいコメントを1件生成してください。

投稿: "{text}"
個人情報: {personal_info}

ルール:
- ひらがな・カタカナ・簡単な漢字のみ
- 40文字以内
- 個人情報の危険性を指摘する内容
- 小学生にも読める言葉で

"""
        elif i < 6:
            # 批判的なコメント
            comment_prompt = f"""
あなたは炎上しているSNS投稿にコメントをする人です。
以下の投稿に対して、批判的で厳しいコメントを1件生成してください。

投稿: "{text}"

ルール:
- ひらがな・カタカナ・簡単な漢字のみ
- 40文字以内
- 怒りや失望の絵文字を使ってもよい
- 内容を批判する
- 小学生にも読める言葉で

例: 「こんなことかいちゃダメでしょ」
"""
        else:
            # 警告・注意喚起のコメント
            comment_prompt = f"""
あなたは炎上しているSNS投稿にコメントをする人です。
以下の投稿に対して、警告や注意を促すコメントを1件生成してください。

投稿: "{text}"

ルール:
- ひらがな・カタカナ・簡単な漢字のみ
- 40文字以内
- 危険性を伝える内容
- 小学生にも読める言葉で

例: 「これけしたほうがいいよ？」
"""
        
        try:
            response = await gemini_model.generate_content_async(comment_prompt)
            comment_text = response.text.strip()
            # プロンプトの例文が含まれていたら除去
            if "例:" in comment_text:
                comment_text = comment_text.split("例:")[0].strip()
        except Exception:
            # エラー時のデフォルトコメント
            if i < 3 and personal_info != "なし":
                comment_text = "じょうほうがもれてるよ？"
            elif i < 6:
                comment_text = "これはよくない！"
            else:
                comment_text = "けしたほうがいいよ？"

        comments.append(comment_text)
    
    return comments


#あおりコメント作成関数
async def generate_link_comments(text: str, num_comments: int = 2, link: str = None) -> list[str]:
    """
    投稿に対して、あおりコメントや誘導リンクを自動生成する関数。
    """
    comments = []
    # 1～num_comments件生成
    for i in range(num_comments):
        # promptでパターンを指定
        prompt = (
            f"""ユーザー投稿：「{text}」\n
            ツイッターリプライでよくある、あおりコメントまたは怪しい誘導リンクつきコメントを日本語で1つ作ってください。
            ルール:
            - ひらがな・カタカナ・簡単な漢字のみ
            - 40文字以内
            - 危険性を伝える内容
            - 小学生にも読める言葉で"""
            f"怪しいリンク付きコメントの場合は、必ずこのURL『{link}』を文中に自然に含めてください。"
            f"『{link}』をクリックするとリンク先に遷移するようにしてください"
            "あおりコメントとリンク付きコメントの割合は1:1くらいで。"
            "出力するのはコメントだけで、余計な説明は不要です。"
        )
        try:
            response = await gemini_model.generate_content_async(prompt)
            comments.append(response.text.strip())
        except Exception as e:
            comments.append(f"AI生成エラー: {e}")
    return comments

