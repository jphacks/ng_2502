from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.cloud import firestore
from firebase_admin import auth, credentials
import firebase_admin
from dotenv import load_dotenv 
import os

# ✅ .envファイルを読み込む
load_dotenv()

print("=" * 50)
print("🔍 環境変数の確認:")
print(f"FIREBASE_AUTH_EMULATOR_HOST = {os.getenv('FIREBASE_AUTH_EMULATOR_HOST')}")
print(f"FIRESTORE_EMULATOR_HOST = {os.getenv('FIRESTORE_EMULATOR_HOST')}")
print("=" * 50)

# ✅ 環境変数を明示的に設定（重要！）
if os.getenv("FIRESTORE_EMULATOR_HOST"):
    os.environ["FIRESTORE_EMULATOR_HOST"] = os.getenv("FIRESTORE_EMULATOR_HOST")
    print(f"🔧 Firestore Emulator設定: {os.environ['FIRESTORE_EMULATOR_HOST']}")

if os.getenv("FIREBASE_AUTH_EMULATOR_HOST"):
    os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = os.getenv("FIREBASE_AUTH_EMULATOR_HOST")
    print(f"🔧 Firebase Auth Emulator設定: {os.environ['FIREBASE_AUTH_EMULATOR_HOST']}")

# ✅ Firebase Admin SDK 初期化（重複防止）
if not firebase_admin._apps:
    if os.getenv("FIRESTORE_EMULATOR_HOST") :
        print("🔧 エミュレータモードで起動します")
        # エミュレータ用: 認証情報不要
        firebase_admin.initialize_app(options={
            'projectId': 'demo-project',  # エミュレータ用のプロジェクトID
        })
        print("✅ Firebase初期化完了（エミュレータモード）")
    else:
        # 本番環境用: 認証情報が必要
        print("⚠️ 本番モードで起動します")
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
        print("✅ Firebase初期化完了（本番モード）")

if os.getenv("FIRESTORE_EMULATOR_HOST"):
    # エミュレータ用
    db = firestore.Client(project='demo-project')
    print("✅ Firestoreクライアント初期化完了（エミュレータ）")
else:
    # 本番用
    db = firestore.Client()
    print("✅ Firestoreクライアント初期化完了（本番）")



# ✅ FastAPI アプリ
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  #本番ではフロントのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer_scheme = HTTPBearer()

# ✅ ヘルスチェック
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "FastAPI is running",
        "firebase_mode": "emulator" if os.getenv("FIRESTORE_EMULATOR_HOST") else "production"
    }

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


@app.post("/create-user")
async def create_user(data: dict):
    """
    Reactから送られたユーザー情報をFirestoreに保存する
    """
    try:
        uid = data.get("uid")
        email = data.get("email")

        if not uid or not email:
            raise HTTPException(status_code=400, detail="UIDとEmailは必須です")

        print(f"📥 受信したデータ: uid={uid}, email={email}")

        user_ref = db.collection("users").document(uid)
        user_data={
            "email": email,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "username": "（未設定）",
            "iconColor": "blue",
            "mode": "じゆう"
        }

        user_ref.set(user_data)

        print(f"✅ Firestoreに登録完了: {uid}")
        print(f"   保存したデータ: {user_data}")

        return {"message": "Firestore登録成功", "uid": uid}

    except Exception as e:
        print(f"❌ Firestore登録失敗: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))