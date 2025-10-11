from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.cloud import firestore
from firebase_admin import auth, credentials
import firebase_admin
from dotenv import load_dotenv 
import os

# ✅ .envファイルを読み込む
load_dotenv()

# ✅ Firebase Emulator用設定
if os.getenv("FIREBASE_AUTH_EMULATOR_HOST"):
    print("🔧 Using Firebase Auth Emulator:", os.getenv("FIREBASE_AUTH_EMULATOR_HOST"))
else:
    print("⚠️ FIREBASE_AUTH_EMULATOR_HOST is not set. Using production Firebase Auth.")

# ✅ Firebase Admin SDK 初期化（重複防止）
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

# ✅ Firestore クライアント
db = firestore.Client()

# ✅ FastAPI アプリ
app = FastAPI()
bearer_scheme = HTTPBearer()

# ✅ トークン検証関数
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


@app.get("/secure-data")
async def secure_endpoint(user=Depends(get_current_user)):
    """認証が必要なサンプルエンドポイント"""
    return {"message": "ログイン成功！", "uid": user["uid"]}
