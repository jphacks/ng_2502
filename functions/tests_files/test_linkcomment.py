import asyncio
from gemini_utils import generate_link_comments

# テスト用の投稿テキスト
test_post = "今日の給食はカレーだった！最高！"
# テスト用のURL
test_url = "https://myfirstfirebase-440d6.web.app/spam"

# テスト関数
async def test():
    # あおり&リンクリプを2件生成
    comments = await generate_link_comments(test_post, num_comments=3, link=test_url)
    for i, com in enumerate(comments):
        print(f"コメント{i+1}: {com}")

# 実行
asyncio.run(test())
