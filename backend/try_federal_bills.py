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

# Try different approaches to fetch federal bills

# Approach 1: Try with "us" jurisdiction
def try_us_jurisdiction():
    url = f"{base_url}/bills"
    params = {
        "jurisdiction": "us",
        "page": 1,
        "per_page": 5
    }
    
    print("\nApproach 1: Using 'us' as jurisdiction")
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

# Approach 2: Try with full jurisdiction ID
def try_full_jurisdiction():
    url = f"{base_url}/bills"
    params = {
        "jurisdiction": "ocd-jurisdiction/country:us/government",
        "page": 1,
        "per_page": 5
    }
    
    print("\nApproach 2: Using full jurisdiction ID")
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

# Approach 3: Try with different session formats for Congress
def try_congress_sessions():
    sessions = ["118", "117", "2023-2024", "20232024"]
    
    print("\nApproach 3: Trying different session formats for Congress")
    
    for session in sessions:
        url = f"{base_url}/bills"
        params = {
            "jurisdiction": "us",
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

# Run all approaches
try_us_jurisdiction()
try_full_jurisdiction()
try_congress_sessions()
