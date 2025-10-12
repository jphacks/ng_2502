import firebase_admin
from firebase_admin import auth
from google.cloud import firestore
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware # CORSを許可するために追加

# Firebase Admin SDKの初期化
if not firebase_admin._apps:
    firebase_admin.initialize_app()

app = FastAPI()
db = firestore.Client()
bearer_scheme = HTTPBearer()

# フロントエンドからのアクセスを許可する(CORS設定)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 本番環境ではフロントエンドのURLに限定するべき
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# トークンを検証する関数
def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        decoded_token = auth.verify_id_token(cred.credentials)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    return decoded_token

# プロフィールを更新するAPI
@app.put("/profile")
async def update_profile(request: Request, user: dict = Depends(get_current_user)):
    user_id = user["uid"]
    data = await request.json()
    
    update_data = {}
    if "username" in data:
        update_data["username"] = data["username"]
    if "iconColor" in data:
        update_data["iconColor"] = data["iconColor"]
    if "mode" in data:
        update_data["mode"] = data["mode"]

    if not update_data:
        raise HTTPException(status_code=400, detail="更新するデータがありません")

    user_ref = db.collection("users").document(user_id)
    user_ref.update(update_data)

    return {"message": "プロフィールが更新されました", "updated_data": update_data}

# 他のAPI (投稿など) もここに追加していきます
# 例:
# @app.post("/post")
# async def create_post(request: Request, user: dict = Depends(get_current_user)):
#     # ... 投稿処理 ...
#     return {"message": "投稿完了"}

