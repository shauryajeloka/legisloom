import sys
sys.path.append('.')
from app.database.connection import SessionLocal
from app.database.models import Bill

# Create database session
db = SessionLocal()

try:
    # Count total bills
    total_bills = db.query(Bill).count()
    print(f"Total bills in database: {total_bills}")
    
    # Count US bills
    us_bills = db.query(Bill).filter(Bill.jurisdiction_name == "United States").count()
    print(f"US Congress bills: {us_bills}")
    
    # Count California bills
    ca_bills = db.query(Bill).filter(Bill.jurisdiction_name == "California").count()
    print(f"California bills: {ca_bills}")
    
    # Show sample of US bills
    print("\nSample of US Congress bills:")
    us_bill_samples = db.query(Bill).filter(Bill.jurisdiction_name == "United States").limit(5).all()
    for bill in us_bill_samples:
        print(f"Bill ID: {bill.identifier}, Session: {bill.session}")
        print(f"Title: {bill.title[:100]}..." if len(bill.title) > 100 else f"Title: {bill.title}")
        print(f"Abstract: {bill.abstract[:100]}..." if len(bill.abstract) > 100 else f"Abstract: {bill.abstract}")
        print(f"Primary Sponsor: {bill.primary_sponsor_name}")
        print(f"Actions: {len(bill.actions) if bill.actions else 0}")
        print(f"Documents: {len(bill.documents) if bill.documents else 0}")
        print(f"Votes: {len(bill.votes) if bill.votes else 0}")
        print(f"Versions: {len(bill.versions) if bill.versions else 0}")
        print(f"Summary: {'Yes' if bill.summary else 'No'}")
        print("---")
    
    # Show sample of California bills if any
    if ca_bills > 0:
        print("\nSample of California bills:")
        ca_bill_samples = db.query(Bill).filter(Bill.jurisdiction_name == "California").limit(5).all()
        for bill in ca_bill_samples:
            print(f"Bill ID: {bill.identifier}, Session: {bill.session}")
            print(f"Title: {bill.title[:100]}..." if len(bill.title) > 100 else f"Title: {bill.title}")
            print(f"Abstract: {bill.abstract[:100]}..." if len(bill.abstract) > 100 else f"Abstract: {bill.abstract}")
            print(f"Primary Sponsor: {bill.primary_sponsor_name}")
            print(f"Actions: {len(bill.actions) if bill.actions else 0}")
            print(f"Documents: {len(bill.documents) if bill.documents else 0}")
            print(f"Votes: {len(bill.votes) if bill.votes else 0}")
            print(f"Versions: {len(bill.versions) if bill.versions else 0}")
            print(f"Summary: {'Yes' if bill.summary else 'No'}")
            print("---")

finally:
    db.close()
