from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import RedirectResponse, StreamingResponse
from models.Model import ShareLinkResponse
import qrcode
import io

router = APIRouter()

# Import shared storage from upload route
from .upload_router import share_links

@router.get("/share/{share_id}")
async def get_share_link(share_id: str):
    """Get shareable link information"""
    print(f"Looking for share_id: {share_id}")
    print(f"Available share_links: {list(share_links.keys())}")
    print(f"Total share_links count: {len(share_links)}")
    
    if share_id not in share_links:
        raise HTTPException(status_code=404, detail=f"Share link not found. Available IDs: {list(share_links.keys())}")
    
    link_data = share_links[share_id]
    return ShareLinkResponse(
        share_url=f"https://fileflow-rho.vercel.app/download/{share_id}",
        original_url=link_data["original_url"],
        filename=link_data["filename"],
        created_at=link_data["created_at"]
    )

@router.get("/s/{share_id}")
async def redirect_to_file(share_id: str):
    """Redirect from share link to actual file"""
    if share_id not in share_links:
        raise HTTPException(status_code=404, detail="Share link not found")
    
    link_data = share_links[share_id]
    original_url = link_data["original_url"]
    
    if not original_url:
        raise HTTPException(status_code=404, detail="File not found")
    
    return RedirectResponse(url=original_url)

@router.get("/qrcode/{share_id}")
async def generate_qr_code(share_id: str):
    """Generate a QR code for a share link"""
    if share_id not in share_links:
        raise HTTPException(status_code=404, detail="Share link not found")
    
    # Get the share URL
    share_url = f"https://fileflow-rho.vercel.app/download/{share_id}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(share_url)
    qr.make(fit=True)
    
    # Create an image from the QR Code instance
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save the image to a bytes buffer
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    # Return the image as a response
    return Response(content=img_byte_arr.getvalue(), media_type="image/png")
