import firebase_admin
from firebase_admin import credentials as admin_credentials, firestore as admin_firestore
import os
import json
import tempfile

db = None

def init_firebase():
    global db

    cred = None

    # 1. ローカルの serviceAccountKey.json を優先
    if os.path.exists("functions/config/serviceAccountKey.json"):
        cred = admin_credentials.Certificate("functions/config/serviceAccountKey.json")

    else:
        # 2. Render 用：環境変数から JSON を取得
        cred_json_str = os.environ.get("GOOGLE_CREDENTIALS_JSON")
        if cred_json_str:
            cred_info = json.loads(cred_json_str)

            # 一時ファイルに書き出す
            with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp:
                tmp.write(json.dumps(cred_info).encode())
                tmp_path = tmp.name

            cred = admin_credentials.Certificate(tmp_path)
        else:
            print("⚠️ サービスアカウントキーが見つかりません。エミュレータモードで動作します。")

    # Firebase 初期化
    try:
        firebase_admin.initialize_app(cred)
    except ValueError:
        pass

    # Firestore クライアント
    if os.getenv("FIRESTORE_EMULATOR_HOST"):
        print("🔥 Firestore Emulator に接続しています")
        db = admin_firestore.Client(project="myfirstfirebase-440d6")
    else:
        print("⚠️ 本番 Firestore に接続しています")
        db = admin_firestore.client()