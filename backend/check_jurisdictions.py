import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
api_key = os.getenv("OPENSTATES_API_KEY")
if not api_key:
    raise ValueError("OPENSTATES_API_KEY environment variable is not set")

# OpenStates API base URL
base_url = "https://v3.openstates.org"
headers = {"X-API-KEY": api_key}

# Function to get all available jurisdictions
def get_jurisdictions():
    url = f"{base_url}/jurisdictions"
    response = requests.get(url, headers=headers)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.text}")
        return None

# Function to get metadata for a specific jurisdiction
def get_jurisdiction_metadata(jurisdiction_id):
    url = f"{base_url}/jurisdictions/{jurisdiction_id}"
    response = requests.get(url, headers=headers)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.text}")
        return None

# Get and print all jurisdictions
print("Fetching all jurisdictions...")
jurisdictions = get_jurisdictions()

if jurisdictions:
    print("\nAvailable jurisdictions:")
    # Look for federal/US Congress jurisdictions
    federal_jurisdiction = None
    california_jurisdiction = None
    
    for jurisdiction in jurisdictions.get("results", []):
        jurisdiction_id = jurisdiction.get('id', '')
        jurisdiction_name = jurisdiction.get('name', '')
        jurisdiction_classification = jurisdiction.get('classification', '')
        
        print(f"ID: {jurisdiction_id}, Name: {jurisdiction_name}, Classification: {jurisdiction_classification}")
        
        # Look for federal/national jurisdiction
        if 'country:us/government' in jurisdiction_id or jurisdiction_name == 'United States' or jurisdiction_classification == 'country':
            federal_jurisdiction = jurisdiction
            print("*** Found Federal/US jurisdiction! ***")
            
        # Also look for California for comparison
        if jurisdiction_name == 'California' and jurisdiction_classification == 'state':
            california_jurisdiction = jurisdiction
            print("*** Found California! ***")
    
    # Check for federal jurisdiction
    if federal_jurisdiction:
        federal_id = federal_jurisdiction.get('id')
        print(f"\nFetching metadata for US Congress ({federal_id})...")
        federal_metadata = get_jurisdiction_metadata(federal_id)
        
        if federal_metadata:
            print("\nAvailable sessions for US Congress:")
            for session in federal_metadata.get("sessions", []):
                print(f"ID: {session.get('identifier')}, Name: {session.get('name')}, Active: {session.get('active')}")
    else:
        print("\nUS Congress/Federal jurisdiction not found in the list. Trying with direct ID...")
        # Try with expected federal ID formats
        federal_ids = [
            "ocd-jurisdiction/country:us/government",
            "ocd-jurisdiction/country:us/congress/government"
        ]
        
        for federal_id in federal_ids:
            print(f"Trying with ID: {federal_id}")
            federal_metadata = get_jurisdiction_metadata(federal_id)
            
            if federal_metadata:
                print("\nAvailable sessions for US Congress:")
                for session in federal_metadata.get("sessions", []):
                    print(f"ID: {session.get('identifier')}, Name: {session.get('name')}, Active: {session.get('active')}")
                break
    
    # Also check California for comparison
    if california_jurisdiction:
        ca_id = california_jurisdiction.get('id')
        print(f"\nFetching metadata for California ({ca_id})...")
        ca_metadata = get_jurisdiction_metadata(ca_id)
        
        if ca_metadata:
            print("\nAvailable sessions for California:")
            for session in ca_metadata.get("sessions", []):
                print(f"ID: {session.get('identifier')}, Name: {session.get('name')}, Active: {session.get('active')}")
