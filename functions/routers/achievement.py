# routers/achievements.py
import asyncio
from fastapi import APIRouter, Depends
from firebase_admin import firestore
from functions.auth.dependencies import get_current_user
import functions.config.firebase as firebase

router = APIRouter()

@router.get("/achievements")
async def get_achievements(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch():
        doc = db.collection("achievements").document(user_id).get()
        return doc.to_dict().get("unlocked", []) if doc.exists else []

    unlocked = await loop.run_in_executor(None, fetch)
    return {"achievements": unlocked}