from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.bill import BillResponse, BillSearchParams
from app.services.openstates import openstates_service
from app.services.claude import claude_service
from app.database.connection import get_db
from app.database.models import Bill, Keyword

# Create router
router = APIRouter(prefix="/bills", tags=["bills"])


@router.get("/", response_model=dict)
async def get_bills(
    jurisdiction: Optional[str] = Query(None, description="Jurisdiction ID (e.g., state:ca)"),
    session: Optional[str] = Query(None, description="Legislative session (e.g., 2023-2024)"),
    subject: Optional[str] = Query(None, description="Bill subject"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Get a list of bills with optional filtering"""
    try:
        # Create search parameters
        search_params = BillSearchParams(
            jurisdiction=jurisdiction,
            session=session,
            subject=subject,
            page=page,
            per_page=per_page
        )
        
        # Call the OpenStates service
        result = openstates_service.search_bills(search_params)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bills: {str(e)}")


@router.get("/search", response_model=dict)
async def search_bills(
    query: str = Query(..., description="Search query"),
    db: Session = Depends(get_db)
):
    """Search for bills by keyword"""
    try:
        # First try to search in our local database
        try:
            # Search in title and abstract (case insensitive)
            db_bills = db.query(Bill).filter(
                or_(
                    Bill.title.ilike(f"%{query}%"),
                    Bill.abstract.ilike(f"%{query}%"),
                    Bill.identifier.ilike(f"%{query}%")
                )
            ).limit(20).all()
            
            # If we found bills in the database, return them
            if db_bills:
                results = []
                for bill in db_bills:
                    results.append({
                        "id": bill.id,
                        "title": bill.title,
                        "identifier": bill.identifier,
                        "classification": bill.classification,
                        "subject": bill.subject,
                        "abstract": bill.abstract,
                        "session": bill.session,
                        "jurisdiction": {
                            "name": bill.jurisdiction_name,
                            "id": bill.jurisdiction_id
                        },
                        "from_organization": None,
                        "created_at": None,
                        "updated_at": bill.updated_at,
                        "primary_sponsor": {
                            "name": bill.primary_sponsor_name,
                            "id": bill.primary_sponsor_id
                        } if bill.primary_sponsor_name else None
                    })
                
                return {
                    "results": results,
                    "pagination": {
                        "total_items": len(results),
                        "page": 1,
                        "per_page": 20,
                        "total_pages": 1
                    },
                    "source": "database"
                }
        
        # If no results in database or database search fails, fall back to OpenStates API
        except Exception as db_error:
            print(f"Database search error: {db_error}")
            # Continue to OpenStates search
            pass
            
        # Fall back to OpenStates API
        search_params = BillSearchParams(query=query)
        result = openstates_service.search_bills(search_params)
        result["source"] = "openstates"
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching bills: {str(e)}")


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: str, db: Session = Depends(get_db)):
    """Get a specific bill by ID"""
    try:
        # First try to get the bill from our database
        try:
            db_bill = db.query(Bill).filter(Bill.id == bill_id).first()
            
            if db_bill:
                # Convert database model to response model
                return BillResponse(
                    id=db_bill.id,
                    title=db_bill.title,
                    identifier=db_bill.identifier,
                    classification=db_bill.classification,
                    subject=db_bill.subject,
                    abstract=db_bill.abstract,
                    session=db_bill.session,
                    jurisdiction={
                        "name": db_bill.jurisdiction_name,
                        "id": db_bill.jurisdiction_id
                    },
                    primary_sponsor={
                        "name": db_bill.primary_sponsor_name,
                        "id": db_bill.primary_sponsor_id
                    } if db_bill.primary_sponsor_name else None,
                    actions=db_bill.actions,
                    documents=db_bill.documents,
                    votes=db_bill.votes,
                    versions=db_bill.versions,
                    updated_at=db_bill.updated_at,
                    summary=db_bill.summary,
                    ai_analysis=db_bill.ai_analysis,
                    source="database"
                )
        except Exception as db_error:
            print(f"Database bill fetch error: {db_error}")
            # Continue to OpenStates fallback
            pass
            
        # Fall back to OpenStates API
        bill_data = openstates_service.get_bill(bill_id)
        bill = openstates_service.transform_bill_data(bill_data)
        
        # Add source information
        bill_dict = bill.dict()
        bill_dict["source"] = "openstates"
        
        # Convert to response model
        response = BillResponse(**bill_dict)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bill: {str(e)}")


@router.get("/{bill_id}/text")
async def get_bill_text(bill_id: str):
    """Get the full text of a bill"""
    try:
        text = openstates_service.get_bill_text(bill_id)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bill text: {str(e)}")


@router.get("/{bill_id}/analysis")
async def get_bill_analysis(bill_id: str):
    """Get AI-generated analysis of a bill (summary and keywords)"""
    try:
        # Get bill data
        bill_data = openstates_service.get_bill(bill_id)
        bill = openstates_service.transform_bill_data(bill_data)
        
        # Get bill text
        bill_text = openstates_service.get_bill_text(bill_id)
        
        # Generate analysis with Claude
        analysis = claude_service.analyze_bill(bill_text, bill.title)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing bill: {str(e)}")
