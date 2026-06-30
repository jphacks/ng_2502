import asyncio
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore as admin_firestore
from functions.auth.dependencies import get_current_user
from pydantic import BaseModel
import functions.config.firebase as firebase

router = APIRouter()


class FriendRequestPayload(BaseModel):
    angou: str


class FriendAcceptPayload(BaseModel):
    uid: str


class _NotFoundException(Exception):
    pass


class _ConflictException(Exception):
    pass


def _get_user_info(db, uid: str) -> dict:
    doc = db.collection("users").document(uid).get()
    if doc.exists:
        data = doc.to_dict()
        return {
            "uid": uid,
            "username": data.get("username", "ユーザー名"),
            "iconColor": data.get("iconColor", "blue"),
        }
    return {"uid": uid, "username": "ユーザー名", "iconColor": "blue"}


@router.get("/friends")
async def get_friends(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch():
        doc = firebase.db.collection("users").document(user_id).get()
        if not doc.exists:
            return []
        friend_uids = doc.to_dict().get("friends", [])
        return [_get_user_info(firebase.db, uid) for uid in friend_uids]

    return await loop.run_in_executor(None, fetch)


@router.get("/friends/requests")
async def get_friend_requests(user_id: str = Depends(get_current_user)):
    loop = asyncio.get_running_loop()

    def fetch():
        doc = firebase.db.collection("users").document(user_id).get()
        if not doc.exists:
            return []
        request_uids = doc.to_dict().get("friendRequests", [])
        return [_get_user_info(firebase.db, uid) for uid in request_uids]

    return await loop.run_in_executor(None, fetch)


@router.post("/friends/request")
async def send_friend_request(
    payload: FriendRequestPayload,
    user_id: str = Depends(get_current_user),
):
    loop = asyncio.get_running_loop()

    def process():
        db = firebase.db
        results = list(
            db.collection("users")
            .where("angou", "==", payload.angou)
            .limit(1)
            .stream()
        )

        if not results:
            raise _NotFoundException()

        target_doc = results[0]
        target_uid = target_doc.id

        # 自分自身への申請
        if target_uid == user_id:
            raise _NotFoundException()

        target_data = target_doc.to_dict()

        # すでにともだち or すでに申請済み
        if user_id in target_data.get("friends", []) or user_id in target_data.get(
            "friendRequests", []
        ):
            raise _ConflictException()

        db.collection("users").document(target_uid).update(
            {"friendRequests": admin_firestore.ArrayUnion([user_id])}
        )

    try:
        await loop.run_in_executor(None, process)
    except _NotFoundException:
        raise HTTPException(status_code=404, detail="ともだちがそんざいしないよ")
    except _ConflictException:
        raise HTTPException(status_code=409, detail="すでにもうしこんだよ")

    return {"message": "もうしこみました"}


@router.post("/friends/accept")
async def accept_friend_request(
    payload: FriendAcceptPayload,
    user_id: str = Depends(get_current_user),
):
    loop = asyncio.get_running_loop()

    def process():
        db = firebase.db
        me_ref = db.collection("users").document(user_id)
        them_ref = db.collection("users").document(payload.uid)

        batch = db.batch()
        # 自分: friends に追加、friendRequests から削除
        batch.update(
            me_ref,
            {
                "friends": admin_firestore.ArrayUnion([payload.uid]),
                "friendRequests": admin_firestore.ArrayRemove([payload.uid]),
            },
        )
        # 相手: friends に追加
        batch.update(
            them_ref,
            {"friends": admin_firestore.ArrayUnion([user_id])},
        )
        batch.commit()

    await loop.run_in_executor(None, process)
    return {"message": "ともだちになりました"}
