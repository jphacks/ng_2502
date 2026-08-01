from dataclasses import dataclass


@dataclass
class DetectionResult:
    category: str
    subtype: str
    matched_text: str
    score: int
    position: tuple[int, int] | None
    confidence: float
