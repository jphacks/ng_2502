
import asyncio
from gemini_utils import validate_comment

async def test_validate_comment():
    # 安全なコメントのテスト
    safe_comment = "小学3年生、サッカーが好き"
    result = await validate_comment(safe_comment, "てんさく")
    print("安全なコメントの結果:", result)

    # 不適切なコメントのテスト
    unsafe_comment = "愛知県名古屋市立名古屋中学校3年A組の山田太郎"
    result = await validate_comment(unsafe_comment, "てんさく")
    print("不適切なコメントの結果:", result)

async def main():
    await test_validate_comment()

if __name__ == "__main__":
    asyncio.run(main())
