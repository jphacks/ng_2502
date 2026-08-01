"""仕様11章 アドバイス生成（テンプレート方式）"""

from functions.safety.models import DetectionResult

# 仕様11章のテンプレート例に加え、検出しうる全subtypeを同じトーンでカバーする。
ADVICE_TEMPLATES: dict[str, str] = {
    "school_name": "学校名を書くと、知らない人にも通っている学校が分かってしまうよ。「学校」と書くと安心だよ。",
    "grade_class": "学年やクラスを書くと、どこの誰か分かりやすくなってしまうよ。書かないようにしよう。",
    "club": "部活動の名前を書くと、通っている学校が分かってしまうことがあるよ。",
    "region": "住所や場所を書くと、住んでいる場所やよくいる場所が分かってしまうよ。",
    "lesson": "習い事や塾の名前を書くと、いつどこにいるか知られてしまうことがあるよ。",
    "person_name": "名前を書くと、だれのことか分かりやすくなってしまうよ。",
    "phone": "電話番号は知らない人に見られると危ないよ。投稿から消してみよう。",
    "email": "メールアドレスは知らない人に見られると危ないよ。投稿から消してみよう。",
    "url": "知らないリンクは、危ないサイトにつながっていることがあるよ。気をつけよう。",
    "line": "LINEなどのIDを書くと、知らない人から連絡が来てしまうことがあるよ。",
    "discord": "Discordなどのアプリの名前を書くと、知らない人から連絡が来てしまうことがあるよ。",
    "discord_tag": "IDを書くと、知らない人から連絡が来てしまうことがあるよ。",
    "instagram": "SNSのアカウントを書くと、知らない人から連絡が来てしまうことがあるよ。",
    "tiktok": "SNSのアカウントを書くと、知らない人から連絡が来てしまうことがあるよ。",
    "dictionary": "読む人が悲しい気持ちになるかもしれないよ。やさしい言葉に変えてみよう。",
    "imperative": "強い言い方は、読む人をこわがらせてしまうかもしれないよ。やさしい言葉に変えてみよう。",
}


def build_advice(results: list[DetectionResult]) -> str:
    """検出結果からスコアの高い順に代表的なテンプレートを組み立てる。"""
    if not results:
        return ""

    sorted_results = sorted(results, key=lambda r: r.score, reverse=True)

    seen_subtypes: set[str] = set()
    messages: list[str] = []
    for result in sorted_results:
        if result.subtype in seen_subtypes:
            continue
        template = ADVICE_TEMPLATES.get(result.subtype)
        if not template:
            continue
        seen_subtypes.add(result.subtype)
        messages.append(template)
        if len(messages) >= 3:
            break

    return "\n".join(messages)
