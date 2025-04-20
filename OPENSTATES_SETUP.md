# OpenStates API Integration

This application uses the OpenStates API to fetch accurate information about bills from state legislatures.

## Setup Instructions

1. **Register for an OpenStates API Key**:
   - Visit [OpenStates API Registration](https://openstates.org/api/register/)
   - Sign up for an account and request an API key
   - Note that they typically approve keys within 24 hours

2. **Add API Key to Environment**:
   - Create or edit the `.env.local` file in the project root
   - Add your API key:
     ```
     OPENSTATES_API_KEY=your_api_key_here
     ```
   - Restart the development server if it's running

3. **API Usage Limits**:
   - The OpenStates API has usage limits for their free tier (typically 1,000 calls per day)
   - Be mindful of how many API calls your application makes
   - Consider implementing caching for frequent queries

## Features Implemented

1. **Bill Search**:
   - Users can search for bills by keyword, bill number, or topic
   - Results are fetched directly from the OpenStates API
   - Auto-suggestions are provided when typing in the search box

2. **State Filtering**:
   - Users can filter bills by state (jurisdiction)
   - The component supports all 50 states plus federal legislation
   - Filters can be combined with text search for more precise results

## API Endpoints Used

- **Bill Search**: `https://v3.openstates.org/bills`
  - Used for searching bills by keywords, bill numbers, etc.
  - Returns a list of bills matching the search criteria
  - Parameters:
    - `q`: Search query (optional)
    - `jurisdiction`: State code (e.g., 'ca' for California, 'us' for federal)
    - `page`: Page number for pagination
    - `per_page`: Number of results per page

- **Bill Detail**: `https://v3.openstates.org/bills/{bill_id}`
  - Used for fetching detailed information about a specific bill
  - Returns complete bill information including sponsors, versions, etc.

- **Jurisdictions**: `https://v3.openstates.org/jurisdictions`
  - Used to get information about available jurisdictions (states)
  - Useful for populating state selection dropdown

## Implementation Details

1. **Next.js API Routes**:
   - `/api/bills/search`: Proxies requests to OpenStates API
   - Handles error cases and timeouts gracefully
   - Transforms the OpenStates response to match our application's data format

2. **React Components**:
   - `SearchForm`: Provides bill search with auto-suggestions
   - `StateSelector`: Allows filtering by state/jurisdiction
   - `BillResultItem`: Displays individual bill search results

3. **Error Handling**:
   - Timeout detection for long-running queries
   - Friendly error messages for users
   - Detailed logging for debugging

## Documentation

For more information about the OpenStates API:
- [OpenStates API Documentation](https://docs.openstates.org/api/v3/)
- [OpenStates Data Overview](https://docs.openstates.org/api/data-types/)

## Troubleshooting

If you encounter issues with the OpenStates API:

1. **Check API Key**: Make sure your API key is correctly set in the environment variables
2. **Rate Limiting**: You might be hitting rate limits; spread out requests or implement caching
3. **Check Response Status**: The application logs API errors to the console
4. **API Changes**: OpenStates occasionally updates their API; check their documentation for changes
5. **Timeouts**: If searches take too long, try narrowing your search with more specific terms or state filters 