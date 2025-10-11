from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.cloud import firestore
from datetime import datetime
import firebase_admin
from firebase_admin import auth

# Firebase Admin SDKを初期化 (一度だけ実行)
firebase_admin.initialize_app()

# Bearerトークンを扱うための設定
bearer_scheme = HTTPBearer()

# トークンを検証し、ユーザー情報を返す依存関数
def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        decoded_token = auth.verify_id_token(cred.credentials)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decoded_token

app = FastAPI()
db = firestore.Client()

