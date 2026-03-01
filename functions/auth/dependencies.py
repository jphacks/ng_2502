import os
import json
import base64
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from firebase_admin import auth

bearer_scheme = HTTPBearer()
# HTTPBearer は、HTTP ヘッダーから Bearer トークンを抽出するための FastAPI のセキュリティスキームです。
#- Authorization → ヘッダーの名前- Bearer → 種類（Bearer 認証）- <IDトークン> → Firebase が発行した本人確認証


def _extract_uid_without_verification(token: str) -> str | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload = parts[1]
        payload += "=" * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload.encode("utf-8")).decode("utf-8")
        data = json.loads(decoded)
        return data.get("user_id") or data.get("uid") or data.get("sub")
    except Exception:
        return None


async def get_current_user(cred = Depends(bearer_scheme)):
    #「get_current_user を呼ぶ前に、bearer_scheme（HTTPBearer）を実行して、その結果を cred に入れておいて」
    # トークンを検証してユーザーIDを取得

    token = cred.credentials

    if os.getenv("ENV") == "local":
        uid = _extract_uid_without_verification(token)
        if uid:
            return uid
        return "test-user"


    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")