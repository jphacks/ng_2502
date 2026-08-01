"""仕様7.3 個人情報検出のうち「人物」「学校」「地域」「その他」カテゴリを担当する。"""

import re

from functions.safety import tokenizer
from functions.safety.dictionaries.loader import load_lines
from functions.safety.models import DetectionResult

SCHOOL_KEYWORDS = load_lines("school_names.txt")
PLACE_KEYWORDS = load_lines("place_names.txt")

# ★プレースホルダ★ 部活動の代表例のみ。実運用ではより網羅的な辞書に差し替える。
CLUB_KEYWORDS = [
    "サッカー部", "野球部", "テニス部", "バスケ部", "バレー部",
    "陸上部", "水泳部", "剣道部", "柔道部", "吹奏楽部", "合唱部", "美術部",
]

# ★プレースホルダ★ 習い事・塾の代表例のみ。
LESSON_KEYWORDS = ["塾", "習い事", "そろばん", "ピアノ教室", "スイミングスクール", "英会話教室"]

GRADE_CLASS_PATTERN = re.compile(r"\d+年\d+組")

SCHOOL_SCORE = 40
GRADE_CLASS_SCORE = 30
CLUB_SCORE = 20
REGION_SCORE = 30
LESSON_SCORE = 20
PERSON_NAME_SCORE = 40


def detect(normalized_text: str) -> list[DetectionResult]:
    if not normalized_text:
        return []

    results: list[DetectionResult] = []

    for keyword in SCHOOL_KEYWORDS:
        if keyword in normalized_text:
            results.append(
                DetectionResult("personal", "school_name", keyword, SCHOOL_SCORE, None, 0.8)
            )

    for match in GRADE_CLASS_PATTERN.finditer(normalized_text):
        results.append(
            DetectionResult("personal", "grade_class", match.group(), GRADE_CLASS_SCORE, None, 0.85)
        )

    for keyword in CLUB_KEYWORDS:
        if keyword in normalized_text:
            results.append(
                DetectionResult("personal", "club", keyword, CLUB_SCORE, None, 0.7)
            )

    for keyword in PLACE_KEYWORDS:
        if keyword in normalized_text:
            results.append(
                DetectionResult("personal", "region", keyword, REGION_SCORE, None, 0.6)
            )

    for keyword in LESSON_KEYWORDS:
        if keyword in normalized_text:
            results.append(
                DetectionResult("personal", "lesson", keyword, LESSON_SCORE, None, 0.6)
            )

    # GiNZAのNER（固有表現抽出）が使える場合、辞書に無い人名・地名を補助的に検出する。
    # GiNZAのラベル体系は詳細だが、ここでは "person" / "location" を含むかで簡易判定する。
    for entity in tokenizer.extract_entities(normalized_text):
        label = entity["label"].lower()
        if "person" in label:
            results.append(
                DetectionResult("personal", "person_name", entity["text"], PERSON_NAME_SCORE, None, 0.6)
            )
        elif "location" in label or "gpe" in label:
            results.append(
                DetectionResult("personal", "region", entity["text"], REGION_SCORE, None, 0.6)
            )

    return results
