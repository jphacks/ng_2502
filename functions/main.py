from firebase_functions import auth_fn
from firebase_admin import initialize_app, firestore

initialize_app()

@auth_fn.on_user_created
def create_user_profile(user: auth_fn.UserRecord) -> None:
    """
    Firebase Authenticationに新しいユーザーが作成されたのをきっかけに、
    Firestoreにそのユーザーのプロフィールデータ（初期状態）を作成する。
    """
    db = firestore.client()

    # Authenticationから取得したユーザーUIDをドキュメントIDとして使用
    user_ref = db.collection("users").document(user.uid)
    
    # 保存する初期データ
    user_ref.set({
        # 【email】 Authenticationの情報からコピー
        "email": user.email,
        # 【createdAt】 サーバーのタイムスタンプを記録
        "createdAt": firestore.SERVER_TIMESTAMP,
        # 【username】 最初は未設定であることが分かるようにしておく
        "username": "（未設定）",
        # 【profileImageUrl】 最初は空欄またはデフォルト画像のURLを入れておく
        "profileImageUrl": None 
    })
    
    print(f"Firestoreにユーザープロフィールを作成しました: {user.uid}")