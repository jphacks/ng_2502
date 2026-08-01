"""仕様7.3 個人情報検出のうち、正規表現で検出できる「連絡先」カテゴリを担当する。"""

import re

from functions.safety.models import DetectionResult

PHONE_PATTERN = re.compile(r"0\d{1,4}-\d{1,4}-\d{3,4}|0\d{9,10}")
EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
URL_PATTERN = re.compile(r"https?://[^\s]+|www\.[^\s]+")
DISCORD_TAG_PATTERN = re.compile(r"[a-z0-9_.]{2,32}#\d{4}")

# キーワードベースの簡易検出（LINE ID等は自由記述のため正確な抽出が難しく、
# 「SNS交換を持ちかけている」ことの検知を主目的とする）
SNS_KEYWORDS = {
    "line": "line",
    "ライン": "line",
    "discord": "discord",
    "ディスコード": "discord",
    "instagram": "instagram",
    "インスタ": "instagram",
    "tiktok": "tiktok",
    "ティックトック": "tiktok",
}

PHONE_SCORE = 80
EMAIL_SCORE = 60
URL_SCORE = 50
SNS_SCORE = 50


def detect(normalized_text: str) -> list[DetectionResult]:
    if not normalized_text:
        return []

    results: list[DetectionResult] = []

    for match in PHONE_PATTERN.finditer(normalized_text):
        results.append(
            DetectionResult("external", "phone", match.group(), PHONE_SCORE, None, 0.9)
        )

    for match in EMAIL_PATTERN.finditer(normalized_text):
        results.append(
            DetectionResult("external", "email", match.group(), EMAIL_SCORE, None, 0.9)
        )

    for match in URL_PATTERN.finditer(normalized_text):
        results.append(
            DetectionResult("external", "url", match.group(), URL_SCORE, None, 0.9)
        )

    for match in DISCORD_TAG_PATTERN.finditer(normalized_text):
        results.append(
            DetectionResult("sns", "discord_tag", match.group(), SNS_SCORE, None, 0.8)
        )

    seen_sns_types: set[str] = set()
    for keyword, sns_type in SNS_KEYWORDS.items():
        if keyword in normalized_text and sns_type not in seen_sns_types:
            seen_sns_types.add(sns_type)
            results.append(
                DetectionResult("sns", sns_type, keyword, SNS_SCORE, None, 0.6)
            )

    return results
