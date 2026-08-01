"""
仕様9章 情報の組み合わせ判定（独自機能）

単語単位ではなく、複数情報の組み合わせから危険度を算出する。
DM専用のケース5（個人情報聞き出し）は、DM機能自体が本フェーズの対象外のため実装しない。
"""

import re

from functions.safety.models import DetectionResult

FREQUENCY_KEYWORDS = ["毎日", "いつも", "よく"]
TIME_PATTERN = re.compile(r"\d{1,2}時")

# 外部連絡・SNS誘導系の組み合わせとみなすsubtype
EXTERNAL_CONTACT_SUBTYPES = {"phone", "line", "discord", "discord_tag", "instagram", "tiktok"}

COMBINATION_SCORE = 50


def check_combinations(normalized_text: str, results: list[DetectionResult]) -> list[str]:
    subtypes = {r.subtype for r in results}
    categories = {r.category for r in results}
    flags: list[str] = []

    # ケース1: 学校名 + (学年クラス or 部活動 or 人名) -> 本人特定リスク
    if "school_name" in subtypes and subtypes & {"grade_class", "club", "person_name"}:
        flags.append("本人特定リスク")

    # ケース2: 地域情報 + 頻度/時間表現 -> 行動パターン公開
    if "region" in subtypes and (
        any(keyword in normalized_text for keyword in FREQUENCY_KEYWORDS)
        or TIME_PATTERN.search(normalized_text)
    ):
        flags.append("行動パターン公開")

    # ケース3: 電話番号 + SNS ID系が複数 -> 外部連絡誘導
    if len(subtypes & EXTERNAL_CONTACT_SUBTYPES) >= 2:
        flags.append("外部連絡誘導")

    # ケース4: 「お前」等の対象を示す言葉 + 暴言 -> 攻撃的表現
    if "お前" in normalized_text and "abuse" in categories:
        flags.append("攻撃的表現")

    return flags
