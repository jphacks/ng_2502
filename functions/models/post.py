from pydantic import BaseModel
from typing import Optional

class PostCreate(BaseModel):
    content: str
    imageUrl: Optional[str] = None
    replyTo: Optional[str] = None
    isToFollower: bool = False