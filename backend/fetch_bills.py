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


def process_bill(db: Session, bill_id: str, analyze: bool = True, retry_count: int = 0, max_retries: int = 3):
    """Fetch a bill from OpenStates, analyze it with Claude, and store in database
    
    Args:
        db: Database session
        bill_id: OpenStates bill ID
        analyze: Whether to analyze the bill with Claude
        retry_count: Current retry attempt
        max_retries: Maximum number of retry attempts
    """
    try:
        print(f"Processing bill {bill_id}...")
        
        # Check if bill already exists in database
        existing_bill = db.query(Bill).filter(Bill.id == bill_id).first()
        if existing_bill:
            print(f"Bill {bill_id} already exists in database. Updating...")
        
        # Fetch bill data from OpenStates
        try:
            bill_data = openstates_service.get_bill(bill_id)
            bill_model = openstates_service.transform_bill_data(bill_data)
        except Exception as e:
            if "429" in str(e) and retry_count < max_retries:
                # Rate limit hit, wait and retry with exponential backoff
                wait_time = 2 ** retry_count * 5  # 5, 10, 20 seconds
                print(f"Rate limit hit. Waiting {wait_time} seconds before retry {retry_count + 1}/{max_retries}...")
                time.sleep(wait_time)
                return process_bill(db, bill_id, analyze, retry_count + 1, max_retries)
            else:
                raise
        
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
        
        # Generate abstract if not available
        if existing_bill.abstract == "No abstract available" and len(existing_bill.title) > 10:
            # Use the title as a simple abstract if it's substantial
            existing_bill.abstract = existing_bill.title
        
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


def fetch_bills(jurisdiction: str = "us", session: str = "118", limit: int = None, analyze: bool = False):
    """Fetch bills from OpenStates and process them
    
    Args:
        jurisdiction: Jurisdiction code (e.g., 'us' for federal, 'ca' for California)
        session: Legislative session (e.g., '118' for 118th Congress, '20232024' for CA 2023-2024)
        limit: Maximum number of bills to fetch (None for all bills)
        analyze: Whether to analyze bills with Claude AI
    """
    try:
        # Create database session
        db = SessionLocal()
        
        try:
            # Initialize counters and pagination
            bills_processed = 0
            page = 1
            per_page = 20  # OpenStates API typically uses 20 items per page
            more_results = True
            retry_count = 0
            max_retries = 3
            
            print(f"Fetching bills from {jurisdiction} for session {session}...")
            
            # Continue fetching until we've processed all bills or reached the limit
            while more_results and (limit is None or bills_processed < limit):
                try:
                    # Create search parameters for current page
                    search_params = BillSearchParams(
                        jurisdiction=jurisdiction,
                        session=session,
                        page=page,
                        per_page=per_page
                    )
                    
                    # Fetch bills from OpenStates
                    print(f"Fetching page {page}...")
                    result = openstates_service.search_bills(search_params)
                    
                    # Reset retry counter on successful request
                    retry_count = 0
                    
                    # Process each bill on the current page
                    results = result.get("results", [])
                    if not results:
                        more_results = False
                        break
                        
                    print(f"Found {len(results)} bills on page {page}")
                    
                    for bill_data in results:
                        bill_id = bill_data.get("id")
                        if bill_id:
                            process_bill(db, bill_id, analyze)
                            bills_processed += 1
                            
                            # Check if we've reached the limit
                            if limit is not None and bills_processed >= limit:
                                break
                            
                            # Add a small delay to avoid rate limiting
                            time.sleep(2)  # Increased delay to reduce rate limiting
                    
                    # Move to next page
                    page += 1
                    print(f"Processed {bills_processed} bills so far...")
                    
                    # Add a delay between pages to avoid rate limiting
                    time.sleep(5)
                    
                except Exception as e:
                    if "429" in str(e) and retry_count < max_retries:
                        # Rate limit hit, wait and retry with exponential backoff
                        retry_count += 1
                        wait_time = 2 ** retry_count * 10  # 20, 40, 80 seconds
                        print(f"Rate limit hit. Waiting {wait_time} seconds before retry {retry_count}/{max_retries}...")
                        time.sleep(wait_time)
                    else:
                        raise
            
            print(f"Completed processing {bills_processed} bills.")
        finally:
            db.close()
    except Exception as e:
        print(f"Error fetching bills: {str(e)}")


if __name__ == "__main__":
    # Parse command line arguments
    import argparse
    
    parser = argparse.ArgumentParser(description="Fetch and process bills from OpenStates")
    parser.add_argument("--jurisdiction", type=str, default="us", 
                      help="Jurisdiction ID (e.g., 'us' for federal Congress, 'ca' for California)")
    parser.add_argument("--session", type=str, default="118", 
                      help="Legislative session (e.g., '118' for 118th Congress, '20232024' for CA 2023-2024)")
    parser.add_argument("--limit", type=int, default=10, 
                      help="Maximum number of bills to fetch (use 0 for all bills)")
    parser.add_argument("--analyze", action="store_true", 
                      help="Analyze bills with Claude AI (requires ANTHROPIC_API_KEY)")
    
    args = parser.parse_args()
    
    # Fetch bills (convert limit=0 to None for fetching all bills)
    limit = None if args.limit == 0 else args.limit
    fetch_bills(args.jurisdiction, args.session, limit, args.analyze)
