import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import tempfile

db = None

def init_firebase():
    global db

    cred = None

    # ローカルの serviceAccountKey.json
    if os.path.exists("functions/config/serviceAccountKey.json"):
        cred = credentials.Certificate("functions/config/serviceAccountKey.json")

    else:
        # Render の環境変数
        cred_json_str = os.environ.get("GOOGLE_CREDENTIALS_JSON")
        if cred_json_str:
            cred_info = json.loads(cred_json_str)

            # 一時ファイルに書き出す
            with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp:
                tmp.write(json.dumps(cred_info).encode("utf-8"))
                tmp_path = tmp.name

            cred = credentials.Certificate(tmp_path)
        else:
            print("⚠️ サービスアカウントキーが見つかりません")
            return

    try:
        firebase_admin.initialize_app(cred)
    except ValueError:
        pass

    print("🔥 Firestore に接続成功")
    db = firestore.client()