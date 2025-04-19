from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.models.bill import BillResponse, BillSearchParams
from app.services.openstates import openstates_service
from app.services.claude import claude_service

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
async def search_bills(query: str = Query(..., description="Search query")):
    """Search for bills by keyword"""
    try:
        # Create search parameters with query
        search_params = BillSearchParams(query=query)
        
        # Call the OpenStates service
        result = openstates_service.search_bills(search_params)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching bills: {str(e)}")


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: str):
    """Get a specific bill by ID"""
    try:
        # Get bill data from OpenStates
        bill_data = openstates_service.get_bill(bill_id)
        
        # Transform to our internal model
        bill = openstates_service.transform_bill_data(bill_data)
        
        # Convert to response model
        response = BillResponse(**bill.dict())
        
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
