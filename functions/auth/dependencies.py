import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from firebase_admin import auth

bearer_scheme = HTTPBearer()
# HTTPBearer は、HTTP ヘッダーから Bearer トークンを抽出するための FastAPI のセキュリティスキームです。
#- Authorization → ヘッダーの名前- Bearer → 種類（Bearer 認証）- <IDトークン> → Firebase が発行した本人確認証


async def get_current_user(cred = Depends(bearer_scheme)):
    #「get_current_user を呼ぶ前に、bearer_scheme（HTTPBearer）を実行して、その結果を cred に入れておいて」
    # トークンを検証してユーザーIDを取得

    if os.getenv("ENV") == "local":
        return "test-user"


    try:
        token = cred.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")