"""仕様7.1 暴言判定 / 7.2 命令表現"""

from functions.safety.models import DetectionResult
from functions.safety.dictionaries.abuse_words import (
    ABUSE_WORDS,
    EMPHASIS_WORDS,
    EMPHASIS_BONUS,
    IMPERATIVE_PHRASES,
    IMPERATIVE_SCORE,
)


def detect(normalized_text: str) -> list[DetectionResult]:
    if not normalized_text:
        return []

    results: list[DetectionResult] = []
    has_emphasis = any(word in normalized_text for word in EMPHASIS_WORDS)

    for word, score in ABUSE_WORDS.items():
        if word in normalized_text:
            total_score = score + EMPHASIS_BONUS if has_emphasis else score
            results.append(
                DetectionResult(
                    category="abuse",
                    subtype="dictionary",
                    matched_text=word,
                    score=total_score,
                    position=None,
                    confidence=1.0,
                )
            )

    for phrase in IMPERATIVE_PHRASES:
        if phrase in normalized_text:
            results.append(
                DetectionResult(
                    category="abuse",
                    subtype="imperative",
                    matched_text=phrase,
                    score=IMPERATIVE_SCORE,
                    position=None,
                    confidence=0.9,
                )
            )

    return results
