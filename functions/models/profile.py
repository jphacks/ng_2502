from pydantic import BaseModel
from typing import Optional

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    comment: Optional[str] = None
    iconColor: Optional[str] = None
    mode: Optional[str] = None