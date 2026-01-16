# utils/achievements.py
from firebase_admin import firestore
from config.firebase import db


ALL_ACHIEVEMENTS = {
    "post_10",
    "post_30",
    "fired_1",
    "like_total_100",
    "reply_total_20",
    "positive_20",
}

def count_user_posts(user_id: str):
    docs = db.collection("posts").where("userId", "==", user_id).stream()
    return sum(1 for _ in docs)

def update_achievements(user_id: str, post_count: int):
    achievement_ref = db.collection("achievements").document(user_id)
    doc = achievement_ref.get()
    existing = doc.to_dict().get("unlocked", []) if doc.exists else []
    achievements = set(existing)

    if post_count >= 10:
        achievements.add("post_10")

    if post_count >= 30:
        achievements.add("post_30")

    total_likes = count_total_predicted_likes(user_id)
    if total_likes >= 100:
        achievements.add("like_total_100")

    total_replies = count_total_predicted_replies(user_id)
    if total_replies >= 20:
        achievements.add("reply_total_20")

    positive_posts = count_positive_posts(user_id)
    if positive_posts >= 20:
        achievements.add("positive_20")

    controversial_posts = count_controversial_posts(user_id)
    if controversial_posts >= 1:
        achievements.add("fired_1")

    if ALL_ACHIEVEMENTS.issubset(achievements):
        achievements.add("all_achievements_unlocked")

    achievement_ref.set({"unlocked": list(achievements)}, merge=True)

def count_controversial_posts(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).where("isControversial", "==", True).stream()
    return sum(1 for _ in docs)

def count_total_predicted_likes(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).stream()
    return sum(doc.to_dict().get("predictedLikes", 0) for doc in docs)

def count_total_predicted_replies(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).stream()
    return sum(doc.to_dict().get("predictedReplyCount", 0) for doc in docs)

def count_positive_posts(user_id: str) -> int:
    docs = db.collection("posts").where("userId", "==", user_id).where("isPositive", "==", True).stream()
    return sum(1 for _ in docs)