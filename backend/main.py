# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload_router, share_router, file_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",  # Vite dev server
        "https://fileflow-rho.vercel.app"  # Vercel deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router.router)
app.include_router(share_router.router)
app.include_router(file_router.router)

@app.get("/")
async def root():
    return {
        "message": "welcome to fileflow"
    }