import os
from typing import List, Dict, Any, Optional
from anthropic import Anthropic


class ClaudeService:
    """Service for interacting with Anthropic's Claude API"""
    
    def __init__(self):
        """Initialize the Claude API client with API key from environment"""
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        
        self.client = Anthropic(api_key=self.api_key)
        self.model = "claude-3-opus-20240229"  # Using the most capable model
    
    def generate_bill_summary(self, bill_text: str, bill_title: str) -> str:
        """Generate a concise summary of a bill"""
        prompt = f"""
        You are an expert in legislative analysis. Please provide a concise summary of the following bill.
        Focus on the main provisions, objectives, and potential impacts.
        
        Bill Title: {bill_title}
        
        Bill Text:
        {bill_text[:100000]}  # Limit text to avoid token limits
        
        Please provide a summary in 3-5 paragraphs that would help a citizen understand what this bill does.
        """
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            temperature=0.2,  # Lower temperature for more factual responses
            system="You are an expert legislative analyst who provides clear, concise, and accurate summaries of bills.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.content[0].text
    
    def extract_keywords(self, bill_text: str, bill_title: str) -> List[str]:
        """Extract relevant keywords from a bill"""
        prompt = f"""
        You are an expert in legislative analysis. Please extract 5-10 relevant keywords or key phrases from the following bill.
        These keywords should help categorize the bill and make it discoverable in searches.
        
        Bill Title: {bill_title}
        
        Bill Text:
        {bill_text[:100000]}  # Limit text to avoid token limits
        
        Please provide ONLY a list of keywords separated by commas, with no additional text or explanation.
        """
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=200,
            temperature=0.2,
            system="You are an expert legislative analyst who extracts relevant keywords from bills.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Process the response to get a clean list of keywords
        keywords_text = response.content[0].text
        keywords = [kw.strip() for kw in keywords_text.split(",")]
        return keywords
    
    def analyze_bill(self, bill_text: str, bill_title: str) -> Dict[str, Any]:
        """Perform comprehensive analysis of a bill, including summary and keywords"""
        summary = self.generate_bill_summary(bill_text, bill_title)
        keywords = self.extract_keywords(bill_text, bill_title)
        
        return {
            "summary": summary,
            "keywords": keywords
        }
    
    def chat_about_bill(self, bill_text: str, bill_title: str, user_question: str) -> str:
        """Answer a user's question about a specific bill"""
        prompt = f"""
        You are an expert in legislative analysis. Please answer the following question about this bill.
        
        Bill Title: {bill_title}
        
        Bill Text:
        {bill_text[:100000]}  # Limit text to avoid token limits
        
        User Question: {user_question}
        
        Please provide a clear, accurate, and helpful answer based on the bill's content.
        """
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            temperature=0.3,
            system="You are an expert legislative analyst who helps users understand bills by answering their questions accurately and clearly.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.content[0].text


# Create a singleton instance
claude_service = ClaudeService()
