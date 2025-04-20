import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory cache for API responses
// This will help reduce API calls to avoid rate limits
const cache: Record<string, { data: any; timestamp: number }> = {};
// Cache expiration time in milliseconds (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

// Simple in-memory cache for bill text responses
const textCache: Record<string, { text: string; timestamp: number }> = {};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure params is properly awaited
    const { id: billId } = await Promise.resolve(params);
    
    // Decode the ID if it's URL encoded
    const decodedId = decodeURIComponent(billId);
    console.log(`Bill Details Request for ID: ${decodedId}`);
    
    // Check if we have a valid cached response
    if (cache[decodedId] && (Date.now() - cache[decodedId].timestamp < CACHE_TTL)) {
      console.log(`Using cached response for ${decodedId}`);
      return NextResponse.json({ bill: cache[decodedId].data });
    }
    
    // Try to fetch from OpenStates API if not cached
    const apiKey = process.env.OPENSTATES_API_KEY;
    
    if (apiKey) {
      try {
        console.log(`Attempting to fetch bill details for ${decodedId} from OpenStates API`);
        const apiUrl = constructOpenStatesApiUrl(decodedId);
        console.log(`Using API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            "X-API-KEY": apiKey
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched bill from OpenStates API`);
          cache[decodedId] = { data, timestamp: Date.now() };
          return NextResponse.json({ bill: data });
        } else {
          // Handle specific error codes
          const errorStatus = response.status;
          const errorText = await response.text();
          console.error(`OpenStates API error: ${errorStatus} - ${errorText}`);
          
          if (errorStatus === 404) {
            return NextResponse.json({ error: "Bill not found in legislative database" }, { status: 404 });
          } else if (errorStatus === 401 || errorStatus === 403) {
            console.error("OpenStates API authentication error - check your API key");
            return NextResponse.json({ error: "Unable to access legislative database due to authentication issues" }, { status: 500 });
          } else if (errorStatus === 422) {
            // This is a validation error in the API request
            console.error("OpenStates API validation error - check query parameters");
            console.error(`Error details: ${errorText}`);
            return NextResponse.json({ 
              error: "Error in API request format",
              details: errorText
            }, { status: 500 });
          } else if (errorStatus === 429) {
            // Rate limit exceeded
            console.error("OpenStates API rate limit exceeded");
            return NextResponse.json({ 
              error: "Rate limit reached for the legislative database API. Please try again later.",
              retryAfter: response.headers.get('Retry-After') || '60'
            }, { status: 429 });
          } else {
            return NextResponse.json({ error: `Error accessing legislative database: ${errorStatus}` }, { status: 500 });
          }
        }
      } catch (apiError: unknown) {
        const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
        console.error(`Error fetching bill from OpenStates API: ${errorMessage}`);
        return NextResponse.json({ error: `Error connecting to legislative database: ${errorMessage}` }, { status: 500 });
      }
    } else {
      console.warn("No OpenStates API key found. Set OPENSTATES_API_KEY in your environment.");
      return NextResponse.json({ error: "API key not configured for legislative database" }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in bills/[id] GET route: ${errorMessage}`);
    return NextResponse.json({ error: `Failed to fetch bill details: ${errorMessage}` }, { status: 500 });
  }
}

// Helper function to construct the appropriate OpenStates API URL based on the bill ID format
function constructOpenStatesApiUrl(billId: string): string {
  // The include parameters we want to fetch
  const includeParams = [
    'sponsorships',
    'abstracts',
    'other_titles',
    'other_identifiers',
    'actions',
    'sources',
    'documents',
    'versions',
    'votes',
    'related_bills'
  ];
  
  // Use separate include parameters (not comma-separated)
  // ?include=sponsorships&include=abstracts&include=other_titles, etc.
  const includeQueryParams = includeParams.map(param => `include=${param}`).join('&');
  
  // If it's already in OpenStates format (ocd-bill), use it directly
  if (billId.startsWith('ocd-bill/')) {
    return `https://v3.openstates.org/bills/${billId}?${includeQueryParams}`;
  }
  
  // Otherwise assume it's in the jurisdiction/session/identifier format
  return `https://v3.openstates.org/bills/${billId}?${includeQueryParams}`;
}

// Helper function to find a bill text URL from versions or documents
function findBillTextUrl(bill: any): string {
  // First check versions for text links
  if (bill.versions && bill.versions.length > 0) {
    for (const version of bill.versions) {
      if (version.links && version.links.length > 0) {
        return version.links[0].url;
      }
    }
  }
  
  // If no version links, try documents
  if (bill.documents && bill.documents.length > 0) {
    for (const doc of bill.documents) {
      if (doc.links && doc.links.length > 0) {
        return doc.links[0].url;
      }
    }
  }
  
  return "";
}

// API endpoint to get bill text
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure params is properly awaited
    const { id: billId } = await Promise.resolve(params);
    // Decode the ID if it's URL encoded
    const decodedId = decodeURIComponent(billId);
    console.log(`Bill Text Request for ID: ${decodedId}`);
    
    // Check if we have a valid cached response
    if (textCache[decodedId] && (Date.now() - textCache[decodedId].timestamp < CACHE_TTL)) {
      console.log(`Using cached text for ${decodedId}`);
      return NextResponse.json({ text: textCache[decodedId].text });
    }
    
    // Try to fetch from OpenStates API first
    const apiKey = process.env.OPENSTATES_API_KEY;
    
    if (apiKey) {
      try {
        console.log(`Attempting to fetch bill text for ${decodedId} from OpenStates API`);
        
        // First get the bill to access its document or version URLs
        const openstatesUrl = constructOpenStatesApiUrl(decodedId);
        console.log(`Using API URL: ${openstatesUrl}`);
        
        const response = await fetch(openstatesUrl, {
          headers: {
            "X-API-KEY": apiKey
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched bill from OpenStates API, looking for text links`);
          
          // Try to find a text URL from versions or documents
          let textUrl = null;
          
          // First check versions for text links
          if (data.versions && data.versions.length > 0) {
            for (const version of data.versions) {
              if (version.links && version.links.length > 0) {
                // Use the first link of the latest version
                textUrl = version.links[0].url;
                break;
              }
            }
          }
          
          // If no version links, try documents
          if (!textUrl && data.documents && data.documents.length > 0) {
            for (const doc of data.documents) {
              if (doc.links && doc.links.length > 0) {
                // Use the first link of the latest document
                textUrl = doc.links[0].url;
                break;
              }
            }
          }
          
          // If we found a URL, try to fetch the text
          if (textUrl) {
            console.log(`Found text URL: ${textUrl}`);
            try {
              const textResponse = await fetch(textUrl);
              if (textResponse.ok) {
                const text = await textResponse.text();
                textCache[decodedId] = { text, timestamp: Date.now() };
                return NextResponse.json({ text });
              } else {
                console.log(`Failed to fetch text from URL: ${textResponse.status}`);
                return NextResponse.json({ error: `Failed to fetch bill text: ${textResponse.status} ${textResponse.statusText}` }, { status: textResponse.status });
              }
            } catch (textError: unknown) {
              const errorMessage = textError instanceof Error ? textError.message : "Unknown error";
              console.error(`Error fetching text from URL: ${errorMessage}`);
              return NextResponse.json({ error: `Error fetching bill text: ${errorMessage}` }, { status: 500 });
            }
          } else {
            console.log(`No text URLs found in the bill data`);
            
            // If we have an abstract, use that as a fallback
            if (data.abstract) {
              console.log(`Using bill abstract as text fallback`);
              const abstractText = `# ${data.identifier}: ${data.title}\n\n## Abstract\n\n${data.abstract}`;
              textCache[decodedId] = { text: abstractText, timestamp: Date.now() };
              return NextResponse.json({ 
                text: abstractText
              });
            } else {
              return NextResponse.json({ error: "No bill text available" }, { status: 404 });
            }
          }
        } else {
          // Handle specific error codes
          const errorStatus = response.status;
          const errorText = await response.text();
          console.error(`OpenStates API error: ${errorStatus} - ${errorText}`);
          if (errorStatus === 404) {
            return NextResponse.json({ error: "Bill not found in legislative database" }, { status: 404 });
          } else if (errorStatus === 401 || errorStatus === 403) {
            console.error("OpenStates API authentication error - check your API key");
            return NextResponse.json({ error: "Unable to access legislative database due to authentication issues" }, { status: 500 });
          } else if (errorStatus === 422) {
            // This is a validation error in the API request
            console.error("OpenStates API validation error - check query parameters");
            return NextResponse.json({ 
              error: "Error in API request format",
              details: errorText
            }, { status: 500 });
          } else if (errorStatus === 429) {
            // Rate limit exceeded
            console.error("OpenStates API rate limit exceeded");
            return NextResponse.json({ 
              error: "Rate limit reached for the legislative database API. Please try again later.",
              retryAfter: response.headers.get('Retry-After') || '60'
            }, { status: 429 });
          } else {
            return NextResponse.json({ error: `Error accessing legislative database: ${errorStatus}` }, { status: errorStatus });
          }
        }
      } catch (apiError: unknown) {
        const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
        console.error(`Error fetching bill from OpenStates API: ${errorMessage}`);
        return NextResponse.json({ error: `Error connecting to legislative database: ${errorMessage}` }, { status: 500 });
      }
    } else {
      console.warn("No OpenStates API key found. Set OPENSTATES_API_KEY in your environment.");
      return NextResponse.json({ error: "API key not configured for legislative database" }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in bills/[id] POST route: ${errorMessage}`);
    return NextResponse.json({ error: `Failed to fetch bill text: ${errorMessage}` }, { status: 500 });
  }
}