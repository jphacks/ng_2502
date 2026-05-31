import google.generativeai as genai
import os
import random

# Gemini API 設定
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    print("⚠️ GEMINI_API_KEY が設定されていません")
    model = None


async def generate_ai_post_text():
    """AI投稿テキストを生成（危険投稿3種 + 小学生の日常投稿）"""

    # 30% の確率で危険投稿
    make_danger = random.random() < 0.3

    if make_danger:
        # 危険投稿の種類をランダムに選ぶ
        danger_type = random.choice(["adult", "bully", "bad_invite"])

        if danger_type == "adult":
            # ★ 大人が子どもに話しかける危険投稿
            prompt = """
            あなたは教育用シミュレーションAIです。
            小学生SNSで「大人が子どもに話しかけてくる危険な投稿」を40文字以内で1つ生成してください。

            条件：
            - 大人が子どもに近づこうとしている文
            - 個人情報を聞く（住所、電話、学校、名前）
            - 会おうと誘う、秘密にしようとする
            - URL やリンクに誘導する
            - 絵文字なし
            - 子どもっぽい文は禁止
            - 本文のみ
            """

        elif danger_type == "bully":
            # ★ 子ども同士の悪口・いじめ系
            prompt = """
            あなたは教育用シミュレーションAIです。
            小学生SNSで「子ども同士の悪口・いじめにつながる危険な投稿」を40文字以内で1つ生成してください。

            条件：
            - 相手を傷つける言葉（うざい、きもい、ばか、など）
            - 仲間外し、無視、悪口
            - 名前や伏字（○○、●●）は禁止
            - 相手を指すときは「その子」「あの子」などを使う
            - 絵文字なし
            - 本文のみ
            """

        else:
            # ★ 子ども同士の悪い誘い・マナー違反系
            prompt = """
            あなたは教育用シミュレーションAIです。
            小学生SNSで「子ども同士の悪い誘い・マナー違反の危険な投稿」を40文字以内で1つ生成してください。

            条件：
            - ルール違反（深夜に遊ぶ、課金、嘘、宿題サボり）
            - 悪いことに誘う（こっそりやろう、バレないよ）
            - 絵文字なし
            - 本文のみ
            """

    else:
        # ★ 小学生の日常投稿（注意喚起は禁止）
        prompt = """
        あなたは小学生です。
        小学生SNSの「日常の安全な投稿」を40文字以内で1つ生成してください。

        条件：
        - 友達・遊び・学校・ゲーム・ご飯・趣味など
        - 個人情報や注意喚起は禁止
        - 絵文字を1つ入れる
        - 本文のみ
        """

    # Gemini で生成
    try:
        if model is None:
            text = "こんにちは！😊"
        else:
            response = model.generate_content(prompt)
            text = response.candidates[0].content.parts[0].text.strip()
    except:
        text = "こんにちは！😊"

    # ★ 危険ワードで内容ベース判定
    DANGER_WORDS = [
        # 大人系
        "住所", "電話", "会おう", "URL", "リンク", "DM", "ライン",
        "学校教えて", "ひみつ", "秘密", "こっそり", "会いたい",
        # いじめ系
        "うざ", "きも", "ばか", "しね", "むし", "仲間外れ",
        # 悪い誘い系
        "バレない", "深夜", "課金", "サボ", "嘘つ"
    ]
    danger = any(w in text for w in DANGER_WORDS)

    # ★ ラベルは「内容」で決める
    if danger:
        risk_level = "danger"
        risk_reason = "危険な投稿の可能性があります"
    else:
        risk_level = "safe"
        risk_reason = "安全な日常投稿です"

    print(f"AI投稿: {text} (risk: {risk_level})")

    return {
        "content": text,
        "riskLevel": risk_level,
        "riskReason": risk_reason
    }
