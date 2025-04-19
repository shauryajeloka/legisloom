import os
import requests
from typing import Dict, List, Optional, Any
from app.models.bill import BillCreate, BillSearchParams


class OpenStatesService:
    """Service for interacting with the OpenStates API"""
    
    def __init__(self):
        """Initialize the OpenStates API client with API key from environment"""
        self.api_key = os.getenv("OPENSTATES_API_KEY")
        if not self.api_key:
            raise ValueError("OPENSTATES_API_KEY environment variable is not set")
        
        self.base_url = "https://v3.openstates.org"
        self.headers = {"X-API-KEY": self.api_key}
    
    def search_bills(self, params: BillSearchParams) -> Dict[str, Any]:
        """Search for bills based on the provided parameters"""
        url = f"{self.base_url}/bills"
        
        # Build query parameters
        query_params = {}
        if params.query:
            query_params["q"] = params.query
        if params.jurisdiction:
            query_params["jurisdiction"] = params.jurisdiction
        if params.session:
            query_params["session"] = params.session
        if params.subject:
            query_params["subject"] = params.subject
        if params.sponsor_id:
            query_params["sponsor_id"] = params.sponsor_id
            
        query_params["page"] = params.page
        query_params["per_page"] = params.per_page
        
        # Make the API request
        response = requests.get(url, headers=self.headers, params=query_params)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        return response.json()
    
    def get_bill(self, bill_id: str) -> Dict[str, Any]:
        """Get a specific bill by ID"""
        url = f"{self.base_url}/bills/{bill_id}"
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        
        return response.json()
    
    def get_bill_text(self, bill_id: str) -> str:
        """Get the full text of a bill"""
        # First get the bill details to find the latest version URL
        bill_data = self.get_bill(bill_id)
        
        # Find the latest version
        versions = bill_data.get("versions", [])
        if not versions:
            return "Bill text not available"
        
        # Sort versions by date (if available) and get the latest
        if "date" in versions[0]:
            versions.sort(key=lambda v: v.get("date", ""), reverse=True)
        
        # Get the URL of the latest version
        latest_version_url = versions[0].get("url")
        if not latest_version_url:
            return "Bill text URL not available"
        
        # Fetch the bill text
        response = requests.get(latest_version_url)
        response.raise_for_status()
        
        # Return the text content
        return response.text
    
    def transform_bill_data(self, data: Dict[str, Any]) -> BillCreate:
        """Transform API response into our internal bill model"""
        # Extract the primary sponsor if available
        primary_sponsor = None
        if data.get("sponsors") and len(data["sponsors"]) > 0:
            sponsor = data["sponsors"][0]
            primary_sponsor = {"name": sponsor.get("name", ""), "id": sponsor.get("id", "")}
        
        # Create the bill object
        bill = BillCreate(
            id=data.get("id", ""),
            title=data.get("title", ""),
            identifier=data.get("identifier", ""),
            classification=data.get("classification", []),
            subject=data.get("subject", []),
            abstract=data.get("abstract", "No abstract available"),
            session=data.get("session", ""),
            jurisdiction={
                "name": data.get("jurisdiction", {}).get("name", ""),
                "id": data.get("jurisdiction", {}).get("id", ""),
            },
            primary_sponsor=primary_sponsor,
            actions=data.get("actions", []),
            documents=data.get("documents", []),
            votes=data.get("votes", []),
            versions=data.get("versions", []),
            updated_at=data.get("updated_at", ""),
        )
        
        return bill


# Create a singleton instance
openstates_service = OpenStatesService()
