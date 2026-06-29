from pydantic import BaseModel


class FollowCreate(BaseModel):
    targetUserID: str
