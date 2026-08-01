from google.cloud import firestore
import os
import json

db = None

def init_firebase():
    global db

    IS_RENDER = os.getenv("RENDER") is not None
    ENV = os.getenv("ENV")

    print(f"🔥 Firebase初期化開始 - ENV={ENV}, IS_RENDER={IS_RENDER}")

    try:
        # --- ローカル（Emulator） ---
        if ENV == "local":
            print("🔥 ローカルモード: Firestore Emulator に接続します")

            os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
            os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"

            db = firestore.Client(project="myfirstfirebase-440d6")
            print("🔥 Firestore Emulator に接続成功")
            return

        # --- 本番（Render） ---
        if IS_RENDER:
            print("🚀 Render 本番モード: GOOGLE_CREDENTIALS_JSON を使用します")

            service_account_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
            if not service_account_json:
                raise RuntimeError("GOOGLE_CREDENTIALS_JSON が設定されていません")

            cred_dict = json.loads(service_account_json)
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/tmp/service_account.json"

            with open("/tmp/service_account.json", "w") as f:
                json.dump(cred_dict, f)

            db = firestore.Client()
            print("🔥 Firestore（本番）に接続成功")
            return

        # --- ローカル（本番 Firestore） ---
        print("🔥 ローカル: 本番 Firestore に接続します")
        db = firestore.Client()
        print("🔥 Firestore（本番）に接続成功")

    except Exception as e:
        print(f"❌ Firebase初期化エラー: {e}")
        db = None
        raise
