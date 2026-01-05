# config/firebase.py　初期設定とか
import firebase_admin
from firebase_admin import credentials as admin_credentials, firestore as admin_firestore
import os
#環境変数導入
import json
#文字列で記録できるようにするためにjsonライブラリをインポート

db = None  # Firestore クライアントをここで共有する

def init_firebase():
    global db#関数の中で変えても外で使えるようにするグローバル変数化

    cred = None
    try:
        # ローカル開発用 firebaseとの接続　秘密鍵
        cred = admin_credentials.Certificate("serviceAccountKey.json")
        # serviceAccountKey.json が存在する場合に使用 - プロジェクト直下に置いたserviceAccountKey.json（Firebase の鍵） を読み込む

    except FileNotFoundError:
        # Render 本番用
        cred_json_str = os.environ.get("GOOGLE_CREDENTIALS_JSON")
        # 環境変数からサービスアカウントキーを取得
        if cred_json_str:
            cred_info = json.loads(cred_json_str)
            cred = admin_credentials.Certificate(cred_info)
        else:
            print("⚠️ サービスアカウントキーが見つかりません。エミュレータモードで動作します。")

    # Firebase Admin 初期化
    if cred:
        try:
            firebase_admin.initialize_app(cred)
        except ValueError:
            pass
    else:
        try:
            firebase_admin.initialize_app()
        except ValueError:
            pass

    # Firestore クライアント作成
    if os.getenv("FIRESTORE_EMULATOR_HOST"):
        print("🔥 Firestore Emulator に接続しています")
        db = admin_firestore.Client(project="myfirstfirebase-440d6")
    else:
        print("⚠️ 本番 Firestore に接続しています")
        db = admin_firestore.client()