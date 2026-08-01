"""
GiNZA（SudachiPyベースのspaCy日本語パイプライン）の読み込みラッパー。

仕様6章のとおりGiNZAをフェーズ1から採用するが、辞書サイズが大きく
未インストール環境でもアプリ全体が落ちないよう、gemini_utils.gemini_model と
同じ「読み込み失敗時はNoneにフォールバックする」パターンを踏襲する。
GiNZA/SudachiPyが利用できない場合、呼び出し側（detectors）は
辞書・正規表現のみで判定を続行する。
"""

_nlp = None
_load_attempted = False


def _load_nlp():
    global _nlp, _load_attempted
    if _load_attempted:
        return _nlp

    _load_attempted = True
    try:
        import spacy

        _nlp = spacy.load("ja_ginza")
    except Exception as e:
        print(f"GiNZAモデルの初期化に失敗しました（辞書/正規表現判定のみで続行します）: {e}")
        _nlp = None

    return _nlp


def get_nlp():
    """GiNZAのLanguageオブジェクトを返す。読み込み失敗時はNone。"""
    return _load_nlp()


def preload_tokenizer():
    """
    アプリ起動時に一度だけ辞書をロードするためのフック（仕様6.2）。
    main.py の init_firebase() 直後から呼び出す想定。
    """
    _load_nlp()


def tokenize(text: str):
    """
    形態素解析を行い、トークン情報のリストを返す。
    GiNZAが使えない場合は空リストを返す（detectors側は辞書・正規表現のみで判定する）。

    戻り値の各要素: {"surface": str, "lemma": str, "pos": str, "ent_type": str}
    """
    nlp = get_nlp()
    if nlp is None or not text:
        return []

    doc = nlp(text)
    return [
        {
            "surface": token.text,
            "lemma": token.lemma_,
            "pos": token.pos_,
            "ent_type": token.ent_type_,
        }
        for token in doc
    ]


def extract_entities(text: str):
    """
    固有表現抽出（NER）結果を返す。GiNZAが使えない場合は空リスト。
    戻り値の各要素: {"text": str, "label": str}
    """
    nlp = get_nlp()
    if nlp is None or not text:
        return []

    doc = nlp(text)
    return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
