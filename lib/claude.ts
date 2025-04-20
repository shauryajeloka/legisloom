import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

/**
 * Generate a summary of a bill using Claude
 * 
 * @param billIdentifier - The bill identifier (e.g., "HB 123")
 * @param billTitle - The title of the bill
 * @param billText - The text content of the bill (if available)
 * @param billAbstract - The abstract of the bill (if available)
 * @returns A summary of the bill
 */
export async function generateBillSummary(
  billIdentifier: string,
  billTitle: string,
  billText?: string,
  billAbstract?: string
): Promise<string> {
  try {
    // Create a prompt for Claude
    let prompt = `Please analyze the following legislative bill and provide a concise, informative summary in 3-4 sentences. Include the bill's main purpose, key provisions, and potential impact. Use straightforward language accessible to the general public.

Bill: ${billIdentifier}
Title: ${billTitle}
`;

    if (billAbstract) {
      prompt += `\nAbstract: ${billAbstract}`;
    }

    if (billText && billText.length > 0) {
      // Only include a portion of the text if it's very long
      const truncatedText = billText.length > 8000 
        ? billText.substring(0, 8000) + "..." 
        : billText;
      prompt += `\n\nBill Text: ${truncatedText}`;
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      temperature: 0.0,
      system: "You are a legislative analyst providing clear, accurate summaries of bills to help citizens understand legislation. Focus on the key points and practical impacts.",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error generating bill summary with Claude:', error);
    return "We couldn't generate an AI summary for this bill at this time.";
  }
} 