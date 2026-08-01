"""仕様8章 リスクスコア計算"""

from functions.safety.models import DetectionResult

# 仕様8章のカテゴリ例に対応する重み
CATEGORY_WEIGHTS = {
    "abuse": 1.0,
    "personal": 1.0,
    "external": 1.0,
    "sns": 1.0,
    "threat": 1.2,
    "combination": 1.0,
}


def compute_risk_scores(results: list[DetectionResult]) -> dict[str, int]:
    """カテゴリごとのスコア合計を返す。"""
    scores: dict[str, int] = {}
    for result in results:
        scores[result.category] = scores.get(result.category, 0) + result.score
    return scores


def compute_total_score(risk_scores: dict[str, int]) -> int:
    """カテゴリ別スコアに重み付けした合計値。"""
    total = sum(
        score * CATEGORY_WEIGHTS.get(category, 1.0)
        for category, score in risk_scores.items()
    )
    return round(total)
