# LegisPal Backend

This is the Python FastAPI backend for the LegisPal legislative discovery and research application. It handles fetching bill data from OpenStates, analyzing bills with Claude AI, and providing API endpoints for the Next.js frontend.

## Features

- Fetch bill data from OpenStates API
- Generate bill summaries and extract keywords using Claude AI
- Provide chatbot functionality for answering questions about bills
- Store bill data in a local database for faster access

## Setup

### Prerequisites

- Python 3.8 or higher
- OpenStates API key (get one at https://openstates.org/api/register/)
- Anthropic Claude API key

### Installation

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables in `.env` file:
   ```
   OPENSTATES_API_KEY=your_openstates_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

## Usage

### Running the API Server

```
python run.py
```

This will start the FastAPI server at http://localhost:8000.

### API Documentation

Once the server is running, you can access the auto-generated API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Fetching Bills

To fetch bills from OpenStates and store them in the database:

```
python fetch_bills.py --jurisdiction ca --session 2023-2024 --limit 10
```

Parameters:
- `--jurisdiction`: State code (e.g., ca for California)
- `--session`: Legislative session (e.g., 2023-2024)
- `--limit`: Maximum number of bills to fetch

## API Endpoints

### Bills

- `GET /api/bills/`: Get a list of bills with optional filtering
- `GET /api/bills/search?query=<query>`: Search for bills by keyword
- `GET /api/bills/{bill_id}`: Get a specific bill by ID
- `GET /api/bills/{bill_id}/text`: Get the full text of a bill
- `GET /api/bills/{bill_id}/analysis`: Get AI-generated analysis of a bill

### Chat

- `POST /api/chat/`: Answer a question about a specific bill
  - Request body: `{"bill_id": "<bill_id>", "question": "<question>"}`

## Integration with Next.js Frontend

The backend is designed to work with the Next.js frontend. Make sure your Next.js app is configured to make API calls to this backend server at http://localhost:8000.
