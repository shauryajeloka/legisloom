import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to the path so we can import our app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import database models and connection
from app.database.connection import Base, engine
from app.database.models import Bill, Keyword  # Import all models

# Create all tables
def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")

if __name__ == "__main__":
    init_db()
