import os
from fastapi import APIRouter, HTTPException
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

# Import shared storage from upload router
# Note: In production, this should be a proper database
from .upload_router import share_links

@router.delete("/delete/{share_id}")
async def delete_file(share_id: str):
    """Delete file from Supabase storage and remove share link"""
    if share_id not in share_links:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        link_data = share_links[share_id]
        file_path = link_data["path"]
        
        # Delete from Supabase storage
        result = supabase.storage.from_(BUCKET_NAME).remove([file_path])
        
        # Check if deletion was successful
        if hasattr(result, 'error') and result.error:
            print(f"Delete error: {result.error}")
            raise HTTPException(status_code=500, detail=f"Delete failed: {result.error}")
        
        # Remove from share_links dictionary
        del share_links[share_id]
        
        print(f"Successfully deleted file: {file_path}")
        return {"ok": True, "message": "File deleted successfully", "share_id": share_id}
        
    except KeyError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        print(f"Unexpected error during deletion: {e}")
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
