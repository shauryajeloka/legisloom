from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="LegisPal API",
    description="API for legislative discovery and research",
    version="0.1.0"
)

# Configure CORS to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import database initialization
from app.database.init_db import init_database

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_database()

# Import routers after app is created to avoid circular imports
from app.routers import bills, chat

# Include routers
app.include_router(bills.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
def read_root():
    """Root endpoint to verify the API is running"""
    return {"message": "Welcome to LegisPal API", "status": "online"}
