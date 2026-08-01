import re
import unicodedata

# 絵文字として扱う主要なUnicodeブロック（記号領域を含む）
_EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U00002600-\U000027BF"
    "\U0001F1E6-\U0001F1FF"
    "]+",
    flags=re.UNICODE,
)

# 連続する同一文字を1文字に圧縮する（例: "ばーーーーか" -> "ばーか"）
# 数字は電話番号等（例: "0120-000-000"）を壊さないよう圧縮対象から除外する
_REPEAT_PATTERN = re.compile(r"([^\d])\1+")

# 半角/全角の空白（改行含む）を除去
_WHITESPACE_PATTERN = re.compile(r"[\s　]+")


def normalize_text(text: str) -> str:
    """
    表記ゆれを統一し、解析精度を向上させる前処理（仕様5章）。

    - Unicode正規化（NFKC）で全角・半角を統一
    - 英字を小文字化
    - 空白を除去
    - 連続文字を圧縮
    - 絵文字を除去
    """
    if not text:
        return ""

    normalized = unicodedata.normalize("NFKC", text)
    normalized = normalized.lower()
    normalized = _EMOJI_PATTERN.sub("", normalized)
    normalized = _WHITESPACE_PATTERN.sub("", normalized)
    normalized = _REPEAT_PATTERN.sub(r"\1", normalized)

    return normalized
