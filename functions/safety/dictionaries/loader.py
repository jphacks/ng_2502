from pathlib import Path

_DICT_DIR = Path(__file__).parent


def load_lines(filename: str) -> list[str]:
    """dictionaries/配下のテキスト辞書を読み込む。空行と#コメント行は無視する。"""
    path = _DICT_DIR / filename
    lines = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            lines.append(line)
    return lines
