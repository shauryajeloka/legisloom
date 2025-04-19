import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a legislative assistant AI. Summarize the following bill text concisely, highlighting key provisions, potential impacts, and stakeholders affected. Format your response in markdown.",
        },
        {
          role: "user",
          content,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    return NextResponse.json({
      success: true,
      summary: response.choices[0].message.content,
    })
  } catch (error) {
    console.error("Error summarizing bill:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to summarize the bill. Please try again.",
      },
      { status: 500 },
    )
  }
}
