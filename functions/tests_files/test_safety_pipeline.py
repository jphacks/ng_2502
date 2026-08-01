"""
投稿安全判定エンジン(functions/safety)の動作確認用スクリプト。
Gemini API呼び出しは行わず、ルールベース判定エンジン単体の出力を目視確認する。

実行方法（リポジトリルートから）:
    python -m functions.tests_files.test_safety_pipeline

docs/spec_post_safety_check.md 9章のケース1〜4（DMのケース5は対象外）を例文として使用する。
"""

from functions.safety.pipeline import analyze_post_safety

SAMPLE_TEXTS = {
    "ケース1: 本人特定リスク": "○○小学校3年2組サッカー部のゆうたです",
    "ケース2: 行動パターン公開": "○○公園に毎日17時にいるよ",
    "ケース3: 外部連絡誘導": "電話番号教えるからLINEとDiscordも交換しよう",
    "ケース4: 攻撃的表現": "お前まじで死ね",
    "参考: 安全な投稿": "今日は公園でたのしくあそんだよ",
}


def main():
    for label, text in SAMPLE_TEXTS.items():
        result = analyze_post_safety(text)
        print("=" * 60)
        print(f"{label}: {text}")
        print(f"  正規化後テキスト: {result.normalized_text}")
        print(f"  検出カテゴリ: {result.detected_labels()}")
        print(f"  カテゴリ別スコア: {result.risk}")
        print(f"  合計スコア: {result.total_score}")
        print(f"  組み合わせ判定: {result.combination_flags}")
        print(f"  アドバイス案:\n{result.advice_text or '(なし)'}")


if __name__ == "__main__":
    main()
