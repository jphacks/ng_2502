import os
from dotenv import load_dotenv
import google.generativeai as genai
import asyncio
import re
import random
import json

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


async def analyze_post_comprehensive(text: str) -> dict:
    """
    投稿の包括的分析を1回のAPI呼び出しで実行。
    ポジティブ判定、反応予測、いいね予測、炎上判定を統合。
    
    戻り値: {
        "is_positive": bool,
        "reply_count": int,
        "reaction_types": list[str],
        "predicted_likes": int,
        "is_controversial": bool
    }
    """
    if not gemini_model:
        return {
            "is_positive": False,
            "reply_count": 3,
            "reaction_types": ["positive", "neutral", "neutral"],
            "predicted_likes": 3,
            "is_controversial": False
        }

    prompt = f"""
あなたはSNS分析AIです。以下の投稿を分析し、JSON形式で結果を返してください。

投稿: "{text}"

以下の項目を分析してください：

1. is_positive: この投稿は読んだ人を明るい気持ちにしますか？ (true/false)

2. reply_count: コメントが何件付くと予測されますか？ (3〜10の整数)

3. reaction_types: コメントのタイプをカンマ区切りで予測してください。
   - タイプは positive / negative / neutral のいずれか
   - reply_countと同じ数だけ生成
   - 例: "positive, neutral, positive"

4. predicted_likes: 「いいね」が何件つくと予測されますか？ (0〜100の整数)

5. is_controversial: この投稿が炎上するリスクがありますか？ (true/false)
   炎上リスクの判定基準:
   - 個人情報（名前、住所、電話番号、学校名など）が含まれている
   - 特定の人物や集団への攻撃的な内容
   - 差別的な表現や偏見を含む内容
   - センシティブなトピック（政治、宗教、人種など）
   - 誤解を招きやすい誇張表現や虚偽の可能性がある内容

出力形式（JSONのみ、他の文章は不要）:
{{
  "is_positive": true,
  "reply_count": 5,
  "reaction_types": "positive, neutral, positive, neutral, positive",
  "predicted_likes": 25,
  "is_controversial": false
}}
"""
    
    try:
        response = await gemini_model.generate_content_async(prompt)
        result_text = response.text.strip()
        
        # JSONの抽出（```json```で囲まれている場合に対応）
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        # JSONをパース
        data = json.loads(result_text)
        
        # reaction_typesを文字列からリストに変換
        reaction_types_str = data.get("reaction_types", "positive, neutral, neutral")
        reaction_types = [t.strip() for t in reaction_types_str.split(",") if t.strip() in ["positive", "neutral", "negative"]]
        
        if not reaction_types:
            reaction_types = ["positive", "neutral", "neutral"]
        
        # reply_countとreaction_typesの整合性を確保
        reply_count = data.get("reply_count", len(reaction_types))
        if len(reaction_types) != reply_count:
            # reaction_typesの数を調整
            if len(reaction_types) < reply_count:
                reaction_types.extend(["neutral"] * (reply_count - len(reaction_types)))
            else:
                reaction_types = reaction_types[:reply_count]
        
        return {
            "is_positive": data.get("is_positive", False),
            "reply_count": reply_count,
            "reaction_types": reaction_types,
            "predicted_likes": max(0, min(100, data.get("predicted_likes", 3))),
            "is_controversial": data.get("is_controversial", False)
        }
        
    except Exception as e:
        print(f"包括的分析エラー: {e}")
        # デフォルト値を返す
        return {
            "is_positive": False,
            "reply_count": 3,
            "reaction_types": ["positive", "neutral", "neutral"],
            "predicted_likes": 3,
            "is_controversial": False
        }


# 後方互換性のための個別関数（内部では統合版を使用）
async def judge_post_positivity(text: str) -> bool:
    result = await analyze_post_comprehensive(text)
    return result["is_positive"]


async def predict_post_reactions(text: str) -> tuple[int, list[str]]:
    result = await analyze_post_comprehensive(text)
    return result["reply_count"], result["reaction_types"]


async def predict_post_likes(text: str) -> int:
    result = await analyze_post_comprehensive(text)
    return result["predicted_likes"]


async def predict_controversy(text: str) -> bool:
    result = await analyze_post_comprehensive(text)
    return result["is_controversial"]


async def predict_viral(text: str, is_positive: bool) -> bool:
    """
    ポジティブな投稿が「バズる」可能性があるかを判定する。
    is_positiveがFalseの場合は必ずFalseを返す。
    バズる確率は正確に5%（1/20）。
    """
    # ポジティブでない場合は必ずFalse
    if not is_positive:
        return False
    
    # 5%の確率でTrue（1/20）
    return random.random() < 0.05


async def generate_reaction_comments_bulk(text: str, reactions: list[str], is_controversial: bool = False) -> list[str]:
    """
    軽量モデル向けに、複数のコメントを1回のAPI呼び出しでまとめて生成。
    炎上時（is_controversial=True）はpositiveタイプのコメントを生成しない。
    戻り値: ["コメント文", ...]
    """
    if not gemini_model:
        return ["いいね！😊" for _ in reactions]

    # 炎上時はpositiveコメントを除外
    if is_controversial:
        reactions = [r for r in reactions if r != "positive"]
    
    if not reactions:
        return []
    
    # 複数コメントを1回で生成
    comment_prompt = f"""
あなたは小学生のSNSユーザーです。
以下の投稿に対して、{len(reactions)}件のコメントを生成してください。

投稿: "{text}"

各コメントのタイプ: {', '.join(reactions)}

ルール:
- 各コメントはひらがな・カタカナ・簡単な漢字のみ
- 各コメントは30文字以内
- 各コメントに絵文字を1つ使う
- 小学生にも読めるやさしい言葉
- タイプに応じた内容（positive=前向き、neutral=中立、negative=否定的）

出力形式（各コメントを改行で区切る）:
コメント1
コメント2
コメント3
...
"""
    
    try:
        response = await gemini_model.generate_content_async(comment_prompt)
        comment_text = response.text.strip()
        comments = [c.strip() for c in comment_text.split('\n') if c.strip()]
        
        # 生成数が足りない場合はデフォルトで補完
        while len(comments) < len(reactions):
            comments.append("いいね！😄")
        
        # 生成数が多すぎる場合は切り詰め
        comments = comments[:len(reactions)]
        
        return comments
    except Exception as e:
        print(f"コメント生成エラー: {e}")
        return ["いいね！😄" for _ in reactions]


async def generate_controversial_comments(text: str, count: int = 10) -> list[str]:
    """
    炎上時の厳しいコメントを1回のAPI呼び出しで複数生成する。
    個人情報が含まれている場合はそれに言及し、批判的な内容を含める。
    """
    if not gemini_model:
        return ["これはダメだよ😠" for _ in range(count)]

    comment_prompt = f"""
あなたは炎上しているSNS投稿にコメントをする人です。
以下の投稿に対して、{count}件の厳しいコメントを生成してください。

投稿: "{text}"

コメントの種類（バランスよく含める）:
1. 個人情報の危険性を指摘するコメント（3件程度）
2. 内容を批判するコメント（4件程度）
3. 警告・注意を促すコメント（3件程度）

ルール:
- 各コメントはひらがな・カタカナ・簡単な漢字のみ
- 各コメントは40文字以内
- 怒りや失望の絵文字を使ってもよい
- 小学生にも読める言葉で
- 例: 「こんなことかいちゃダメでしょ」「これけしたほうがいいよ？」

出力形式（各コメントを改行で区切る、{count}件生成）:
コメント1
コメント2
コメント3
...
"""
    
    try:
        response = await gemini_model.generate_content_async(comment_prompt)
        comment_text = response.text.strip()
        comments = [c.strip() for c in comment_text.split('\n') if c.strip()]
        
        # 生成数が足りない場合はデフォルトで補完
        default_comments = ["これはよくない！", "けしたほうがいいよ？", "じょうほうがもれてるよ？"]
        while len(comments) < count:
            comments.append(default_comments[len(comments) % len(default_comments)])
        
        # 生成数が多すぎる場合は切り詰め
        comments = comments[:count]
        
        return comments
    except Exception as e:
        print(f"炎上コメント生成エラー: {e}")
        return ["これはダメだよ😠" for _ in range(count)]


async def generate_viral_comments(text: str, count: int = 15) -> list[str]:
    """
    バズり時のポジティブで盛り上がるコメントを1回のAPI呼び出しで複数生成する。
    称賛、共感、拡散を促す内容を含める。
    """
    if not gemini_model:
        return ["すごい！😍" for _ in range(count)]

    comment_prompt = f"""
あなたはバズっているSNS投稿にコメントをする人です。
以下の投稿に対して、{count}件の盛り上がるコメントを生成してください。

投稿: "{text}"

コメントの種類（バランスよく含める）:
1. 強い称賛・感動のコメント（5件程度）- 嬉しい・興奮の絵文字（😍✨🎉💖🌟など）
2. 共感・賛同のコメント（5件程度）- ポジティブな絵文字（👍💯🙌😊など）
3. 拡散・応援のコメント（5件程度）- 応援の絵文字（🔥💪🎊✨など）

ルール:
- 各コメントはひらがな・カタカナ・簡単な漢字のみ
- 各コメントは40文字以内
- 小学生にも読める言葉で
- 例: 「これめっちゃすごい！😍✨」「わかる！ほんとそれ！👍」「これみんなにおしえたい！🔥」

出力形式（各コメントを改行で区切る、{count}件生成）:
コメント1
コメント2
コメント3
...
"""
    
    try:
        response = await gemini_model.generate_content_async(comment_prompt)
        comment_text = response.text.strip()
        comments = [c.strip() for c in comment_text.split('\n') if c.strip()]
        
        # 生成数が足りない場合はデフォルトで補完
        default_comments = ["すごい！😍✨", "わかる！👍", "これすき！🔥"]
        while len(comments) < count:
            comments.append(default_comments[len(comments) % len(default_comments)])
        
        # 生成数が多すぎる場合は切り詰め
        comments = comments[:count]
        
        return comments
    except Exception as e:
        print(f"バズりコメント生成エラー: {e}")
        return ["すごい！😍" for _ in range(count)]


#XSS対策
def sanitize_ai_output(text):
    # <script>タグ削除
    text = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", text, flags=re.DOTALL)
    # javascript:リンク削除
    text = re.sub(r"javascript:", "", text, flags=re.IGNORECASE)
    return text

#あおりコメント作成関数
async def generate_link_comments(text: str, num_comments: int = 2, link: str = None) -> list[str]:
    """
    投稿に対して、あおりコメントや誘導リンクを1回のAPI呼び出しで複数生成する。
    """
    
    def url_to_link(comment: str) -> str:
        # URLらしき部分をaタグに変換
        return re.sub(
            r'(https?://[^\s]+)',
            r'<a href="\1" target="_blank" rel="noopener noreferrer">\1</a>',
            comment
        )
    
    if not gemini_model:
        return [f"AI生成エラー" for _ in range(num_comments)]
    
    prompt = f"""
ユーザー投稿：「{text}」

ツイッターリプライでよくある、あおりコメントまたは怪しい誘導リンクつきコメントを日本語で{num_comments}つ作ってください。

ルール:
- ひらがな・カタカナ・簡単な漢字のみ
- 各コメントは40文字以内
- 小学生にも読める言葉で
- URL（{link}）が入る場合はMarkdownやHTMLにせず、プレーンテキストそのままを文章中に含めてください。
- 怪しいリンク付きコメントの場合は、必ずこのURL『{link}』を文中に自然に含めてください。
- あおりコメントとリンク付きコメントの割合は1:1くらいで。

出力形式（各コメントを改行で区切る、コメント本文だけ、{num_comments}件生成）:
コメント1
コメント2
...
"""
    
    try:
        response = await gemini_model.generate_content_async(prompt)
        safe_text = sanitize_ai_output(response.text.strip())
        comments_list = [c.strip() for c in safe_text.split('\n') if c.strip()]
        
        # 各コメントにHTMLリンク変換を適用
        html_comments = [url_to_link(c) for c in comments_list]
        
        # 生成数が足りない場合はデフォルトで補完
        while len(html_comments) < num_comments:
            html_comments.append(f"AI生成エラー")
        
        # 生成数が多すぎる場合は切り詰め
        html_comments = html_comments[:num_comments]
        
        return html_comments
    except Exception as e:
        return [f"AI生成エラー: {e}" for _ in range(num_comments)]