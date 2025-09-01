import os, io, uuid, hashlib, json
from fastapi import APIRouter, UploadFile, File, HTTPException
from supabase import create_client
from dotenv import load_dotenv
import asyncio
from typing import List

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

share_links = {}

# File size limit (49MB)
MAX_FILE_SIZE = 49 * 1024 * 1024

async def upload_single_file(file: UploadFile) -> dict:
    """Upload a single file with optimizations"""
    try:
        # Check file size before reading
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB")
        
        # Read file in chunks to avoid memory issues
        contents = b""
        chunk_size = 1024 * 1024  # 1MB chunks
        total_size = 0
        
        while chunk := await file.read(chunk_size):
            total_size += len(chunk)
            if total_size > MAX_FILE_SIZE:
                raise HTTPException(status_code=413, detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB")
            contents += chunk
        
        if not contents:
            raise HTTPException(status_code=400, detail="empty file")
            
        # sanitize filename for Supabase storage (remove/replace special chars)
        import re
        safe_filename = re.sub(r'[^\w\-_.]', '_', file.filename)
        safe_filename = re.sub(r'_+', '_', safe_filename)  # replace multiple underscores with single
        safe_filename = safe_filename.strip('_')  # remove leading/trailing underscores
        
        filename = f"{uuid.uuid4().hex}_{safe_filename}"
        path = f"uploads/{filename}"

        print(f"Uploading file: {filename} ({total_size} bytes)")

        # upload via Supabase Python client
        result = supabase.storage.from_(BUCKET_NAME).upload(
            path=path,
            file=contents,
            file_options={"content-type": file.content_type, "upsert": "false"}
        )

        # Check if upload was successful
        if hasattr(result, 'error') and result.error:
            print(f"Upload error: {result.error}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {result.error}")

        # Get the public URL for the uploaded file
        try:
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(path)
        except Exception as e:
            print(f"Error getting public URL: {e}")
            public_url = None

        # Generate shareable link
        share_id = hashlib.md5(f"{filename}_{uuid.uuid4()}".encode()).hexdigest()[:8]
        share_url = f"https://fileflow-rho.vercel.app/download/{share_id}"
        
        # Store mapping
        share_links[share_id] = {
            "original_url": public_url,
            "filename": file.filename,
            "path": path,
            "created_at": str(asyncio.get_event_loop().time())
        }
        
        print(f"Created share_id: {share_id}")
        print(f"Stored in share_links: {share_id in share_links}")
        print(f"Total share_links after upload: {len(share_links)}")
        
        return {
            "ok": True, 
            "path": path, 
            "filename": filename,
            "original_name": file.filename,
            "size": total_size,
            "content_type": file.content_type,
            "public_url": public_url,
            "share_url": share_url,
            "share_id": share_id,
            "upload_success": True
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during upload: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Single file upload endpoint"""
    return await upload_single_file(file)

@router.post("/upload-multiple")
async def upload_multiple(files: List[UploadFile] = File(...)):
    """Multiple file upload endpoint with concurrent processing"""
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Too many files. Max 20 files per batch")
    
    try:
        # Process files concurrently with semaphore to limit concurrent uploads
        semaphore = asyncio.Semaphore(5)  # Max 5 concurrent uploads
        
        async def upload_with_semaphore(file: UploadFile):
            async with semaphore:
                return await upload_single_file(file)
        
        # Upload all files concurrently
        results = await asyncio.gather(
            *[upload_with_semaphore(file) for file in files],
            return_exceptions=True
        )

        
        successful_uploads = []
        failed_uploads = []
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                failed_uploads.append({
                    "filename": files[i].filename,
                    "error": str(result)
                })
            else:
                successful_uploads.append(result)
        
        return {
            "successful_uploads": successful_uploads,
            "failed_uploads": failed_uploads,
            "total_files": len(files),
            "successful_count": len(successful_uploads),
            "failed_count": len(failed_uploads)
        }
        
    except Exception as e:
        print(f"Unexpected error during batch upload: {e}")
        raise HTTPException(status_code=500, detail=f"Batch upload failed: {str(e)}")
