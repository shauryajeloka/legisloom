from .connection import engine, Base
from .models import Bill, Keyword, ChatHistory

def init_database():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully.")
