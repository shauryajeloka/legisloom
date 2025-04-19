import os
import sys
import time
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Load environment variables
load_dotenv()

# Add the current directory to the path so we can import our app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our app modules
from app.services.openstates import openstates_service
from app.services.claude import claude_service
from app.database.connection import SessionLocal
from app.database.models import Bill, Keyword
from app.models.bill import BillSearchParams


def get_or_create_keyword(db: Session, name: str):
    """Get an existing keyword or create a new one"""
    keyword = db.query(Keyword).filter(Keyword.name == name).first()
    if not keyword:
        keyword = Keyword(name=name)
        db.add(keyword)
        db.commit()
        db.refresh(keyword)
    return keyword


def process_bill(db: Session, bill_id: str, analyze: bool = True):
    """Fetch a bill from OpenStates, analyze it with Claude, and store in database"""
    try:
        print(f"Processing bill {bill_id}...")
        
        # Check if bill already exists in database
        existing_bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if existing_bill:
            print(f"Bill {bill_id} already exists in database. Updating...")
        
        # Fetch bill data from OpenStates
        bill_data = openstates_service.get_bill(bill_id)
        bill_model = openstates_service.transform_bill_data(bill_data)
        
        # Create or update bill record
        if not existing_bill:
            existing_bill = Bill(
                id=bill_model.id,
                title=bill_model.title,
                identifier=bill_model.identifier,
                classification=bill_model.classification,
                subject=bill_model.subject,
                abstract=bill_model.abstract,
                session=bill_model.session,
                jurisdiction_name=bill_model.jurisdiction.name,
                jurisdiction_id=bill_model.jurisdiction.id,
                primary_sponsor_name=bill_model.primary_sponsor.name if bill_model.primary_sponsor else None,
                primary_sponsor_id=bill_model.primary_sponsor.id if bill_model.primary_sponsor else None,
                actions=bill_model.actions,
                documents=bill_model.documents,
                votes=bill_model.votes,
                versions=bill_model.versions,
            )
            db.add(existing_bill)
        else:
            # Update existing bill
            existing_bill.title = bill_model.title
            existing_bill.identifier = bill_model.identifier
            existing_bill.classification = bill_model.classification
            existing_bill.subject = bill_model.subject
            existing_bill.abstract = bill_model.abstract
            existing_bill.session = bill_model.session
            existing_bill.jurisdiction_name = bill_model.jurisdiction.name
            existing_bill.jurisdiction_id = bill_model.jurisdiction.id
            existing_bill.primary_sponsor_name = bill_model.primary_sponsor.name if bill_model.primary_sponsor else None
            existing_bill.primary_sponsor_id = bill_model.primary_sponsor.id if bill_model.primary_sponsor else None
            existing_bill.actions = bill_model.actions
            existing_bill.documents = bill_model.documents
            existing_bill.votes = bill_model.votes
            existing_bill.versions = bill_model.versions
        
        # Commit changes to database
        db.commit()
        db.refresh(existing_bill)
        
        # If analyze flag is set, perform AI analysis with Claude
        if analyze:
            try:
                # Get bill text
                bill_text = openstates_service.get_bill_text(bill_id)
                
                if bill_text and bill_text != "Bill text not available":
                    print(f"Analyzing bill {bill_id} with Claude...")
                    
                    # Generate summary and keywords
                    analysis = claude_service.analyze_bill(bill_text, bill_model.title)
                    
                    # Update bill with summary
                    existing_bill.summary = analysis["summary"]
                    
                    # Add keywords
                    for keyword_name in analysis["keywords"]:
                        keyword = get_or_create_keyword(db, keyword_name)
                        if keyword not in existing_bill.keywords:
                            existing_bill.keywords.append(keyword)
                    
                    # Commit changes
                    db.commit()
                    db.refresh(existing_bill)
                    
                    print(f"Analysis complete for bill {bill_id}")
                else:
                    print(f"Bill text not available for {bill_id}. Skipping analysis.")
            except Exception as e:
                print(f"Error analyzing bill {bill_id}: {str(e)}")
        
        return existing_bill
    except Exception as e:
        print(f"Error processing bill {bill_id}: {str(e)}")
        return None


def fetch_bills(jurisdiction: str = "ca", session: str = "2023-2024", limit: int = 10):
    """Fetch bills from OpenStates and process them"""
    try:
        # Create database session
        db = SessionLocal()
        
        try:
            # Create search parameters
            search_params = BillSearchParams(
                jurisdiction=jurisdiction,
                session=session,
                page=1,
                per_page=limit
            )
            
            # Fetch bills from OpenStates
            print(f"Fetching bills from {jurisdiction} for session {session}...")
            result = openstates_service.search_bills(search_params)
            
            # Process each bill
            bills_processed = 0
            for bill_data in result.get("results", []):
                bill_id = bill_data.get("id")
                if bill_id:
                    process_bill(db, bill_id)
                    bills_processed += 1
                    
                    # Add a small delay to avoid rate limiting
                    time.sleep(1)
            
            print(f"Processed {bills_processed} bills.")
        finally:
            db.close()
    except Exception as e:
        print(f"Error fetching bills: {str(e)}")


if __name__ == "__main__":
    # Parse command line arguments
    import argparse
    
    parser = argparse.ArgumentParser(description="Fetch and process bills from OpenStates")
    parser.add_argument("--jurisdiction", type=str, default="ca", help="Jurisdiction ID (e.g., ca for California)")
    parser.add_argument("--session", type=str, default="2023-2024", help="Legislative session")
    parser.add_argument("--limit", type=int, default=10, help="Maximum number of bills to fetch")
    
    args = parser.parse_args()
    
    # Fetch bills
    fetch_bills(args.jurisdiction, args.session, args.limit)
