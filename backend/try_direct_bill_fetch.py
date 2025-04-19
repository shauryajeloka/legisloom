import os
import requests
import json
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

# Try different approaches to fetch bills

# Approach 1: Try direct bill search with minimal parameters
def try_direct_search():
    url = f"{base_url}/bills"
    params = {
        "jurisdiction": "ca",  # Just the state code
        "page": 1,
        "per_page": 5
    }
    
    print("\nApproach 1: Direct bill search with minimal parameters")
    print(f"URL: {url}")
    print(f"Params: {params}")
    
    response = requests.get(url, headers=headers, params=params)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total results: {data.get('pagination', {}).get('total_items', 0)}")
        print(f"First few results: {json.dumps(data.get('results', [])[:2], indent=2)}")
    else:
        print(f"Error: {response.text}")

# Approach 2: Try with jurisdiction in OCD format
def try_ocd_format():
    url = f"{base_url}/bills"
    params = {
        "jurisdiction": "ocd-jurisdiction/country:us/state:ca/government",
        "page": 1,
        "per_page": 5
    }
    
    print("\nApproach 2: Using full OCD jurisdiction format")
    print(f"URL: {url}")
    print(f"Params: {params}")
    
    response = requests.get(url, headers=headers, params=params)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total results: {data.get('pagination', {}).get('total_items', 0)}")
        print(f"First few results: {json.dumps(data.get('results', [])[:2], indent=2)}")
    else:
        print(f"Error: {response.text}")

# Approach 3: Try with different session formats
def try_different_sessions():
    sessions = ["2023-2024", "20232024", "2023", "2024"]
    
    print("\nApproach 3: Trying different session formats")
    
    for session in sessions:
        url = f"{base_url}/bills"
        params = {
            "jurisdiction": "ca",
            "session": session,
            "page": 1,
            "per_page": 5
        }
        
        print(f"\nTrying session: {session}")
        print(f"URL: {url}")
        print(f"Params: {params}")
        
        response = requests.get(url, headers=headers, params=params)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total results: {data.get('pagination', {}).get('total_items', 0)}")
            if data.get('pagination', {}).get('total_items', 0) > 0:
                print(f"First result: {json.dumps(data.get('results', [])[0], indent=2)}")
        else:
            print(f"Error: {response.text}")

# Approach 4: Try to get a specific bill by ID
def try_specific_bill():
    # Try a few different bill ID formats
    bill_ids = ["ocd-bill/ca/2023/AB1", "ca/2023/AB1", "ca/2023-2024/AB1"]
    
    print("\nApproach 4: Trying to fetch a specific bill by ID")
    
    for bill_id in bill_ids:
        url = f"{base_url}/bills/{bill_id}"
        
        print(f"\nTrying bill ID: {bill_id}")
        print(f"URL: {url}")
        
        response = requests.get(url, headers=headers)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Bill found: {data.get('id')} - {data.get('title')}")
        else:
            print(f"Error: {response.text}")

# Run all approaches
try_direct_search()
try_ocd_format()
try_different_sessions()
try_specific_bill()
