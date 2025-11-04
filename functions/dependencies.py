import os
import json
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials as admin_credentials, auth
from firebase_admin import firestore as admin_firestore

# --- Firebase Admin SDKの初期化とFirestoreクライアント ---
cred = None
try:
    # ローカル開発用にサービスアカウントキーファイルを試す
    cred = admin_credentials.Certificate("serviceAccountKey.json")
except FileNotFoundError:
    # 本番環境用に環境変数から読み込む (Renderなどで設定)
    cred_json_str = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if cred_json_str:
        cred_info = json.loads(cred_json_str)
        cred = admin_credentials.Certificate(cred_info)
    else:
        print("⚠️ サービスアカウントキーが見つかりません。エミュレータモードでのみ動作します。")

# credが見つかった場合のみFirebase Adminを初期化
if cred:
    try:

        firebase_admin.initialize_app(cred)
    except ValueError as e:
        # すでに初期化されている場合は無視
        if "already exists" not in str(e):
            raise e
else:
     # エミュレータ使用時など、credがない場合でも初期化を試みる（一部機能は制限される）
     try:
        firebase_admin.initialize_app()
     except ValueError as e:
        if "already exists" not in str(e):
            raise e


# Firestoreクライアントの初期化 (エミュレータ/本番切り替え)
if os.getenv("FIRESTORE_EMULATOR_HOST"):
    print("🔥 Firestore Emulator に接続しています")
    db = admin_firestore.Client(project="myfirstfirebase-440d6") # エミュレータの場合はプロジェクトIDが必要なことがある
else:
    print("⚠️ 本番Firestoreに接続しています")
    # 本番環境では credentials は initialize_app で設定済みなので不要
    db = admin_firestore.client()

# --- 変更点2: 認証用の関数を定義 ---
# HTTPBearer スキーマのインスタンスを作成
bearer_scheme = HTTPBearer()

async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    """ヘッダーからトークンを取得し、検証してユーザーIDを返す"""
    if cred is None:
        print("❌ Authorization ヘッダーがありません")
        raise HTTPException(status_code=401, detail="Bearer token missing")

    print(f"🔍 受け取ったトークン: {cred.credentials[:30]}...")  # トークンの先頭だけ表示

    try:
        decoded_token = auth.verify_id_token(cred.credentials)
        print(f"✅ トークン検証成功: uid={decoded_token['uid']}")
        return decoded_token['uid']
    except Exception as e:
        print(f"❌ トークン検証失敗: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")
