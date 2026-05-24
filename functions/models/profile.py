from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    username: str
    comment: str
    iconColor: str
    mode: str