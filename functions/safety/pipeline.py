"""
仕様4章 処理フロー: 前処理 -> テキスト解析 -> ルールベース判定 -> リスクスコア計算
-> 情報の組み合わせ判定 -> アドバイス生成 を一気通貫で実行する唯一の公開エントリポイント。

Gemini最終判定(10章)自体はここでは行わず、この結果を functions.gemini_utils 側に渡す。
"""

from dataclasses import dataclass

from functions.safety import combination
from functions.safety.advice import build_advice
from functions.safety.detectors import abuse_detector, personal_detector, regex_detector
from functions.safety.models import DetectionResult
from functions.safety.preprocessing import normalize_text
from functions.safety.scoring import compute_risk_scores, compute_total_score

# 内部subtype -> 仕様10.2のGemini入力例に合わせた日本語ラベル
DETECTED_LABELS: dict[str, str] = {
    "school_name": "学校名",
    "grade_class": "学年・クラス",
    "club": "部活動",
    "region": "地域情報",
    "lesson": "習い事・塾",
    "person_name": "人物名",
    "phone": "電話番号",
    "email": "メールアドレス",
    "url": "URL",
    "line": "LINE",
    "discord": "Discord",
    "discord_tag": "Discordタグ",
    "instagram": "Instagram",
    "tiktok": "TikTok",
    "dictionary": "暴言",
    "imperative": "命令表現",
}


@dataclass
class SafetyAnalysis:
    original_text: str
    normalized_text: str
    detections: list[DetectionResult]
    risk: dict[str, int]
    total_score: int
    combination_flags: list[str]
    advice_text: str

    def detected_labels(self) -> list[str]:
        labels: list[str] = []
        for detection in self.detections:
            label = DETECTED_LABELS.get(detection.subtype, detection.subtype)
            if label not in labels:
                labels.append(label)
        return labels

    def to_gemini_input(self) -> dict:
        """仕様10.2の入力例に対応する形式に変換する。"""
        return {
            "text": self.original_text,
            "risk": self.risk,
            "detected": self.detected_labels(),
            "combination_flags": self.combination_flags,
            "advice_text": self.advice_text,
        }


def analyze_post_safety(text: str) -> SafetyAnalysis:
    normalized = normalize_text(text)

    detections: list[DetectionResult] = []
    detections.extend(abuse_detector.detect(normalized))
    detections.extend(personal_detector.detect(normalized))
    detections.extend(regex_detector.detect(normalized))

    combination_flags = combination.check_combinations(normalized, detections)

    risk = compute_risk_scores(detections)
    if combination_flags:
        risk["combination"] = (
            risk.get("combination", 0) + len(combination_flags) * combination.COMBINATION_SCORE
        )

    total_score = compute_total_score(risk)
    advice_text = build_advice(detections)

    return SafetyAnalysis(
        original_text=text,
        normalized_text=normalized,
        detections=detections,
        risk=risk,
        total_score=total_score,
        combination_flags=combination_flags,
        advice_text=advice_text,
    )
