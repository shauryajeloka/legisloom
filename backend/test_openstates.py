import os
import requests
import json

# Use the actual API key provided
api_key = "ce658c08-5cb0-4848-b50c-7ae88cf2b7a3"

print(f"Using API key: {api_key}")

# Test a simpler request to the jurisdictions endpoint
def get_jurisdictions():
    url = "https://v3.openstates.org/jurisdictions"
    headers = {
        'X-API-KEY': api_key
    }
    
    print(f"Making request to {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error: {response.text}")
            return None
        
        return response.json()
    except requests.exceptions.Timeout:
        print("Request timed out. The API might be experiencing issues.")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

# Run the test
print("Fetching jurisdictions...")
results = get_jurisdictions()

if results:
    jurisdictions = results.get('results', [])
    print(f"Found {len(jurisdictions)} jurisdictions")
    for i, jurisdiction in enumerate(jurisdictions[:5]):  # Print first 5 jurisdictions
        print(f"\nJurisdiction {i+1}:")
        print(f"Name: {jurisdiction.get('name')}")
        print(f"ID: {jurisdiction.get('id')}")
        print(f"Classification: {jurisdiction.get('classification')}")
else:
    print("Failed to fetch jurisdictions.")

# Only try bill search if jurisdictions worked
if results:
    print("\n\nTrying bill search with state filter...")
    
    # Try a bill search with more specific parameters
    def search_bills(state='az', query='', page=1, per_page=3):
        url = "https://v3.openstates.org/bills"
        params = {
            'jurisdiction': state,
            'page': page,
            'per_page': per_page,
        }
        
        # Only add query if provided
        if query:
            params['q'] = query
            
        headers = {
            'X-API-KEY': api_key
        }
        
        print(f"Making request to {url} with params {params}")
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=15)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Error: {response.text}")
                return None
            
            return response.json()
        except requests.exceptions.Timeout:
            print("Request timed out. Try narrowing your search.")
            return None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    # Try searching for bills in Arizona
    bill_results = search_bills()
    
    if bill_results:
        bills = bill_results.get('results', [])
        print(f"Found {len(bills)} bills")
        for i, bill in enumerate(bills[:3]):  # Print first 3 bills
            print(f"\nBill {i+1}:")
            print(f"ID: {bill.get('id')}")
            print(f"Identifier: {bill.get('identifier')}")
            print(f"Title: {bill.get('title')}")
            print(f"Session: {bill.get('session')}")
            
            subjects = bill.get('subject', [])
            if subjects:
                print(f"Subjects: {', '.join(subjects)}")
            else:
                print("Subjects: None") 