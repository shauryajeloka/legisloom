from sqlalchemy import Column, String, Integer, Text, ForeignKey, Table, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .connection import Base

# Association table for bill-keyword many-to-many relationship
bill_keyword = Table(
    "bill_keyword",
    Base.metadata,
    Column("bill_id", String, ForeignKey("bills.id")),
    Column("keyword_id", Integer, ForeignKey("keywords.id")),
)


class Bill(Base):
    """SQLAlchemy model for bills"""
    __tablename__ = "bills"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    identifier = Column(String, index=True)
    classification = Column(JSON)  # Store as JSON array
    subject = Column(JSON, default=list())  # Store as JSON array
    abstract = Column(Text, default="No abstract available")
    session = Column(String, index=True)
    jurisdiction_name = Column(String, index=True)
    jurisdiction_id = Column(String, index=True)
    primary_sponsor_name = Column(String, nullable=True)
    primary_sponsor_id = Column(String, nullable=True, index=True)
    actions = Column(JSON, default=list())  # Store as JSON array
    documents = Column(JSON, default=list())  # Store as JSON array
    votes = Column(JSON, default=list())  # Store as JSON array
    versions = Column(JSON, default=list())  # Store as JSON array
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # AI-generated fields
    summary = Column(Text, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    
    # Relationships
    keywords = relationship("Keyword", secondary=bill_keyword, back_populates="bills")
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "identifier": self.identifier,
            "classification": self.classification,
            "subject": self.subject,
            "abstract": self.abstract,
            "session": self.session,
            "jurisdiction": {
                "name": self.jurisdiction_name,
                "id": self.jurisdiction_id,
            },
            "primary_sponsor": {
                "name": self.primary_sponsor_name,
                "id": self.primary_sponsor_id,
            } if self.primary_sponsor_name else None,
            "actions": self.actions,
            "documents": self.documents,
            "votes": self.votes,
            "versions": self.versions,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "summary": self.summary,
            "ai_analysis": self.ai_analysis,
            "keywords": [k.name for k in self.keywords],
        }


class Keyword(Base):
    """SQLAlchemy model for keywords"""
    __tablename__ = "keywords"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    # Relationships
    bills = relationship("Bill", secondary=bill_keyword, back_populates="keywords")


class ChatHistory(Base):
    """SQLAlchemy model for storing chat history"""
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(String, ForeignKey("bills.id"), index=True)
    question = Column(Text)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
