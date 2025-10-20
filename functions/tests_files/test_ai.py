import asyncio
from gemini_utils import (
    validate_post_safety,
    judge_post_positivity,
    predict_post_reactions,
    generate_reaction_comments_bulk,
)

async def main():
    # text = "今日はみんなで公園に行ってサッカーしたよ！めっちゃ楽しかった⚽️"
    text = "コンビニからお菓子盗んだよ！誰にも言わないでね！"

    print("==== 安全性チェック ====")
    safe, reason = await validate_post_safety(text)
    print(f"Safe: {safe}, Reason: {reason}")

    print("\n==== ポジティブ判定 ====")
    positive = await judge_post_positivity(text)
    print(f"Positive: {positive}")

    print("\n==== 反応予測 ====")
    reply_count, types = await predict_post_reactions(text)
    print(f"Reply Count: {reply_count}")
    print(f"Types: {types}")

    print("\n==== 一括コメント生成 ====")
    comments = await generate_reaction_comments_bulk(text, types)
    print("Comments:")
    for c in comments:
        print(f"- {c}")

if __name__ == "__main__":
    asyncio.run(main())
