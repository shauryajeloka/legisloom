import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI with error handling
let openai: OpenAI
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  })
} catch (error) {
  console.error("Error initializing OpenAI:", error)
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI is properly initialized
    if (!openai) {
      console.error("OpenAI client not initialized")
      return NextResponse.json(
        {
          success: false,
          error: "AI service unavailable",
        },
        { status: 503 },
      )
    }

    // Parse the request body with error handling
    let billContent, userMessage
    try {
      const body = await request.json()
      billContent = body.billContent
      userMessage = body.userMessage
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

    // Prepare a simplified system prompt - keep it very short
    const systemPrompt = `You are a legislative assistant. Answer questions about this bill: ${billContent.substring(0, 1000)}`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage.substring(0, 500), // Limit user message length
          },
        ],
        temperature: 0.3,
        max_tokens: 500, // Reduce token limit to avoid issues
      })

      // Check if we have a valid response
      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error("Invalid response from AI service")
      }

      return NextResponse.json({
        success: true,
        message: response.choices[0].message.content || "I couldn't generate a response.",
      })
    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError)

      // Handle specific OpenAI errors
      if (openaiError.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: "AI service is currently busy. Please try again later.",
          },
          { status: 429 },
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
