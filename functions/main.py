from firebase_functions import auth_fn
from firebase_admin import initialize_app, firestore

# アプリを初期化
initialize_app()

# この @auth_fn.on_user_created が「ユーザーが作成されたら」という合図
@auth_fn.on_user_created
def create_user_profile(user: auth_fn.UserRecord) -> None:
    """
    新しいユーザーが作成された際に、Firestoreにそのユーザー用の
    プロフィールデータを作成する。
    """
    try:
        print(f"✅ 関数がトリガーされました: UID={user.uid}, Email={user.email}")
        
        db = firestore.client()
        user_ref = db.collection("users").document(user.uid)
        
        user_ref.set({
            "email": user.email,
            "createdAt": firestore.SERVER_TIMESTAMP,
            "username": "（未設定）",
            "iconColor": "blue", # アイコンの色の初期値
            "mode": "じゆう"     # モードの初期値
        })
        
        print(f"✅ Firestoreにプロフィールを作成しました: {user.uid}")

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
