from fastapi import FastAPI, Request
from google.cloud import firestore
from datetime import datetime

app = FastAPI()
db = firestore.Client()

@app.post("/post")
async def create_post(request: Request):
    data = await request.json()
    post = {
        "userId": data["userId"],
        "content": data["content"],
        "imageUrl": data.get("imageUrl", None),
        "timestamp": datetime.utcnow(),
        "replyTo": data.get("replyTo", None),
        "likes": []
    }
    doc_ref = db.collection("posts").add(post)
    return {"message": "投稿完了", "postId": doc_ref[1].id}

@app.post("/like/{post_id}")
async def toggle_like(post_id: str, request: Request):
    data = await request.json()
    user_id = data["userId"]
    post_ref = db.collection("posts").document(post_id)
    post_doc = post_ref.get()

    if not post_doc.exists:
        return {"error": "投稿が見つかりません"}

    post = post_doc.to_dict()
    likes = post.get("likes", [])

    if user_id in likes:
        likes.remove(user_id)
    else:
        likes.append(user_id)

    post_ref.update({"likes": likes})
    return {"message": "いいね更新", "likes": likes}

@app.get("/replies/{post_id}")
def get_replies(post_id: str):
    replies = db.collection("posts") \
                .where("replyTo", "==", post_id) \
                .order_by("timestamp") \
                .stream()
    return [r.to_dict() for r in replies]