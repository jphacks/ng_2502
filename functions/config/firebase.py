import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import tempfile

db = None

def init_firebase():
    global db

    if os.getenv("ENV") == "local":
        print("🔥 ローカルモード: Firebase Emulator に接続します")

        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
        os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"

        cred = credentials.Certificate("functions/config/serviceAccountKey.json")

        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app(cred, {
                "projectId": "myfirstfirebase-440d6"  # ← 本番と同じ ID に統一
            })

        db = firestore.client()
        print("🔥 Firestore Emulator に接続成功")
        return

    # --- 本番 ---
    cred = credentials.Certificate("functions/config/serviceAccountKey.json")

    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)

    print("🔥 Firestore（本番）に接続成功")
    db = firestore.client()