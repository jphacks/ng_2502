import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
import io

db = None

def init_firebase():
    global db

    cred = None

    if os.path.exists("functions/config/serviceAccountKey.json"):
        cred = credentials.Certificate("functions/config/serviceAccountKey.json")
    else:
        cred_json_str = os.environ.get("GOOGLE_CREDENTIALS_JSON")
        if cred_json_str:
            cred_info = json.loads(cred_json_str)
            cred = credentials.Certificate(cred_info)
        else:
            print("⚠️ サービスアカウントキーが見つかりません。エミュレータモードで動作します。")

    try:
        firebase_admin.initialize_app(cred)
    except ValueError:
        pass

    if os.getenv("FIRESTORE_EMULATOR_HOST"):
        print("🔥 Firestore Emulator に接続しています")
        db = firestore.Client(project="myfirstfirebase-440d6")
    else:
        print("⚠️ 本番 Firestore に接続しています")
        db = firestore.client()