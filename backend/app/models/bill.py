from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class Jurisdiction(BaseModel):
    """Model for a bill's jurisdiction (state)"""
    name: str
    id: str


class Sponsor(BaseModel):
    """Model for a bill sponsor (legislator)"""
    name: str
    id: str


class Action(BaseModel):
    """Model for legislative actions taken on a bill"""
    date: str
    description: str
    classification: List[str]


class Document(BaseModel):
    """Model for documents associated with a bill"""
    url: str
    note: str


class VoteCounts(BaseModel):
    """Model for vote counts on a bill"""
    yes: int
    no: int
    abstain: int


class Vote(BaseModel):
    """Model for a vote on a bill"""
    date: str
    result: str
    counts: VoteCounts


class Version(BaseModel):
    """Model for different versions of a bill"""
    url: str
    note: str
    date: str


class BillBase(BaseModel):
    """Base model for bill data"""
    id: str
    title: str
    identifier: str
    classification: List[str]
    subject: List[str] = []
    session: str
    jurisdiction: Jurisdiction


class BillCreate(BillBase):
    """Model for creating a new bill record"""
    abstract: str = "No abstract available"
    primary_sponsor: Optional[Sponsor] = None
    actions: List[Action] = []
    documents: List[Document] = []
    votes: List[Vote] = []
    versions: List[Version] = []
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class BillInDB(BillCreate):
    """Model for a bill as stored in the database"""
    pass


class BillResponse(BillInDB):
    """Model for bill data returned to the client"""
    # Add any additional fields for the response
    keywords: List[str] = []
    summary: str = ""
    ai_analysis: Optional[str] = None
    source: Optional[str] = "database"  # Where the bill data came from: 'database' or 'openstates'


class BillSearchParams(BaseModel):
    """Parameters for searching bills"""
    query: Optional[str] = None
    jurisdiction: Optional[str] = None
    session: Optional[str] = None
    subject: Optional[str] = None
    sponsor_id: Optional[str] = None
    page: int = 1
    per_page: int = 20
