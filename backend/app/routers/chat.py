from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from app.services.openstates import openstates_service
from app.services.claude import claude_service
from typing import Optional

# Create router
router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    """Model for chat request"""
    bill_id: str
    question: str
    

class ChatResponse(BaseModel):
    """Model for chat response"""
    answer: str
    bill_title: Optional[str] = None


@router.post("/", response_model=ChatResponse)
async def chat_with_bill(request: ChatRequest = Body(...)):
    """Answer a question about a specific bill using Claude"""
    try:
        # Get bill data
        bill_data = openstates_service.get_bill(request.bill_id)
        bill = openstates_service.transform_bill_data(bill_data)
        
        # Get bill text
        bill_text = openstates_service.get_bill_text(request.bill_id)
        
        # Get answer from Claude
        answer = claude_service.chat_about_bill(
            bill_text=bill_text,
            bill_title=bill.title,
            user_question=request.question
        )
        
        return ChatResponse(answer=answer, bill_title=bill.title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")
