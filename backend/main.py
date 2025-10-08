from fastapi import FastAPI

# FastAPIのインスタンスを作成
app = FastAPI()

# ルートURL ("/") へのGETリクエストを処理する関数
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}