from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    username: str
    iconColor: str
    mode: str