from pydantic import BaseModel

class ShareLinkResponse(BaseModel):
    share_url: str
    original_url: str
    filename: str
    created_at: str
