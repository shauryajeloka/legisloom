import { type NextRequest, NextResponse } from "next/server"
import Anthropic from '@anthropic-ai/sdk'; // Import Anthropic

// Initialize Anthropic with error handling
let anthropic: Anthropic;
try {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "", // Use Anthropic key
  });
} catch (error) {
  console.error("Error initializing Anthropic:", error)
}

export async function POST(request: NextRequest) {
  try {
    // Check if Anthropic is properly initialized
    if (!anthropic) {
      console.error("Anthropic client not initialized")
      return NextResponse.json(
        {
          success: false,
          error: "AI service unavailable",
        },
        { status: 503 },
      )
    }

    // Parse the request body with error handling
    let billContent, userMessage, billTitle, billIdentifier, billSession, billJurisdiction, billDate, billSponsor, billStatus, completeBillData
    try {
      const body = await request.json()
      billContent = body.billContent
      userMessage = body.userMessage
      billTitle = body.billTitle
      billIdentifier = body.billIdentifier
      billSession = body.billSession
      billJurisdiction = body.billJurisdiction
      billDate = body.billDate
      billSponsor = body.billSponsor
      billStatus = body.billStatus
      completeBillData = body.completeBillData // Get the complete bill data
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
        },
        { status: 400 },
      )
    }

    // Validate the required fields
    if (!billContent || typeof billContent !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Bill content is required and must be a string",
        },
        { status: 400 },
      )
    }

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "User message is required and must be a string",
        },
        { status: 400 },
      )
    }

    // Prepare the system prompt for Claude with bill metadata
    // Claude works better with system prompts specified in the `system` parameter
    let systemPrompt = `You are a helpful legislative assistant with the ability to search the internet. You are analyzing the following bill:

`
    
    // Add bill metadata if available
    if (billTitle) systemPrompt += `Title: ${billTitle}
`
    if (billIdentifier) systemPrompt += `Identifier: ${billIdentifier}
`
    if (billJurisdiction) systemPrompt += `Jurisdiction: ${billJurisdiction}
`
    if (billSession) systemPrompt += `Legislative Session: ${billSession}
`
    if (billSponsor) systemPrompt += `Primary Sponsor: ${billSponsor}
`
    if (billStatus) systemPrompt += `Current Status: ${billStatus}
`
    if (billDate) {
      try {
        // Format date if possible
        const date = new Date(billDate)
        systemPrompt += `Last Updated: ${date.toLocaleDateString()}
`
      } catch (e) {
        systemPrompt += `Last Updated: ${billDate}
`
      }
    }
    
    // Build search query for the bill
    let searchQuery = '';
    if (billIdentifier && billJurisdiction) {
      searchQuery = `${billIdentifier} ${billJurisdiction} legislature`;
    } else if (billTitle) {
      searchQuery = `${billTitle} bill legislature`;
    }
    
    // Log the bill metadata we've received
    console.log('Bill metadata received by API:', {
      title: billTitle,
      identifier: billIdentifier,
      jurisdiction: billJurisdiction,
      session: billSession,
      sponsor: billSponsor,
      status: billStatus,
      date: billDate,
      contentLength: billContent?.length || 0
    });
    
    // Ensure we have structured content even if billContent is empty
    let formattedContent = billContent;
    
    // If content is empty or very short, create a structured representation
    if (!billContent || billContent.length < 50 || completeBillData) {
      console.log('Creating comprehensive structured content from bill data');
      
      let structuredContent = '';
      
      // If we have the complete bill data, use it to create a comprehensive representation
      if (completeBillData) {
        console.log('Using complete bill data to create structured content');
        
        structuredContent += `BILL INFORMATION:
`;
        structuredContent += `Title: ${completeBillData.title || 'Unknown'}
`;
        structuredContent += `Identifier: ${completeBillData.identifier || 'Unknown'}
`;
        structuredContent += `Session: ${completeBillData.session || 'Unknown'}
`;
        structuredContent += `Jurisdiction: ${completeBillData.jurisdiction?.name || 'Unknown'}
`;
        
        if (completeBillData.primarySponsor?.name) {
          structuredContent += `Primary Sponsor: ${completeBillData.primarySponsor.name}
`;
        }
        
        // Add abstract if available
        if (completeBillData.abstract && completeBillData.abstract.length > 0) {
          structuredContent += `
ABSTRACT:
${completeBillData.abstract}
`;
        }
        
        // Add actions/history in chronological order
        if (completeBillData.actions && completeBillData.actions.length > 0) {
          structuredContent += `
LEGISLATIVE HISTORY:
`;
          
          // Sort actions by date (oldest first)
          const sortedActions = [...completeBillData.actions].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          sortedActions.forEach(action => {
            try {
              const date = new Date(action.date).toLocaleDateString();
              structuredContent += `${date}: ${action.description} `;
              if (action.classification && action.classification.length > 0) {
                structuredContent += `[${action.classification.join(', ')}]`;
              }
              structuredContent += `
`;
            } catch (e) {
              console.error('Error formatting action:', e);
            }
          });
        }
        
        // Add votes if available
        if (completeBillData.votes && completeBillData.votes.length > 0) {
          structuredContent += `
VOTES:
`;
          completeBillData.votes.forEach(vote => {
            try {
              const date = new Date(vote.date).toLocaleDateString();
              structuredContent += `${date}: Result: ${vote.result} (Yes: ${vote.counts?.yes || 0}, No: ${vote.counts?.no || 0}, Abstain: ${vote.counts?.abstain || 0})
`;
            } catch (e) {
              console.error('Error formatting vote:', e);
            }
          });
        }
        
        formattedContent = structuredContent;
      } else {
        // Fallback to basic metadata if we don't have complete bill data
        structuredContent += `BILL INFORMATION:
`;
        if (billTitle) structuredContent += `Title: ${billTitle}
`;
        if (billIdentifier) structuredContent += `Identifier: ${billIdentifier}
`;
        if (billJurisdiction) structuredContent += `Jurisdiction: ${billJurisdiction}
`;
        if (billSession) structuredContent += `Session: ${billSession}
`;
        if (billSponsor) structuredContent += `Primary Sponsor: ${billSponsor}
`;
        if (billStatus) structuredContent += `Current Status: ${billStatus}
`;
        if (billDate) structuredContent += `Last Updated: ${billDate}
`;
        
        formattedContent = structuredContent;
      }
    }
    
    systemPrompt += `

Bill Content: ${formattedContent ? formattedContent.substring(0, 4000) : 'No bill content available.'}

If you cannot answer the user's question based on the provided information, you may search for additional information online. 

To search for more information about this bill, you can use the following search query: "${searchQuery}"

Answer the user's question as accurately as possible. If you use external information beyond what was provided, clearly indicate this in your response.`; // Increased context limit for Claude

    try {
      // Use anthropic.messages.create
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229", // Specify a Claude model
        system: systemPrompt, // Pass system prompt here
        messages: [
          {
            role: "user",
            content: userMessage.substring(0, 500), // Limit user message length remains
          },
        ],
        temperature: 0.3,
        max_tokens: 1024, // Increased token limit for Claude
      });

      // Check if we have a valid response structure for Anthropic
      if (!response.content || !response.content[0] || response.content[0].type !== 'text') {
        console.error('Invalid response structure from Anthropic:', response);
        throw new Error("Invalid response from AI service")
      }

      return NextResponse.json({
        success: true,
        message: response.content[0].text || "I couldn't generate a response.",
      });

    } catch (anthropicError: any) {
      console.error("Anthropic API error:", anthropicError)

      // Handle specific Anthropic errors (check status code if available)
      if (anthropicError.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: "AI service is currently busy. Please try again later.",
          },
          { status: 429 },
        )
      }
      
      // Add handling for authentication errors (e.g., invalid API key)
      if (anthropicError.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: "AI service authentication failed. Please check the API key.",
          },
          { status: 401 },
        )
      }
      
      // Add handling for invalid request errors
      if (anthropicError.status === 400) {
         return NextResponse.json(
          {
            success: false,
            error: `Invalid request to AI service: ${anthropicError.message || 'Bad Request'}`, 
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to process your question. Please try again with a simpler query.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unhandled error in bill chat:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
