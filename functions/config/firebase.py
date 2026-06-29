import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

db = None

def init_firebase():
    global db

    IS_RENDER = os.getenv("RENDER") is not None
    ENV = os.getenv("ENV")

    # --- ローカル（Emulator） ---
    if ENV == "local":
        print("ローカルモード: Firebase Emulator に接続します")

        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
        os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"

        cred = credentials.Certificate("config/serviceAccountKey.json")

        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app(cred, {
                "projectId": "myfirstfirebase-440d6"
            })

        db = firestore.client()
        print("Firestore Emulator に接続成功")
        return

    # --- 本番（Render） ---
    if IS_RENDER:
        print("🚀 Render 本番モード: 環境変数 GOOGLE_CREDENTIALS_JSON を使用します")

        service_account_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        if not service_account_json:
            raise RuntimeError("GOOGLE_CREDENTIALS_JSON が設定されていません")

        cred_dict = json.loads(service_account_json)
        cred = credentials.Certificate(cred_dict)

    else:
        # ローカルだけど ENV=local じゃない場合
        cred = credentials.Certificate("config/serviceAccountKey.json")

    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)

    print("🔥 Firestore（本番）に接続成功")
    db = firestore.client()