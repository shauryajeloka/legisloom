import { Anthropic } from '@anthropic-ai/sdk';

// Get the API key from environment variables
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

if (!CLAUDE_API_KEY) {
  console.warn('WARNING: CLAUDE_API_KEY is not set in environment variables. AI summarization will not work.');
}

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

/**
 * Generate a summary of a bill using Claude
 * 
 * @param billIdentifier - The bill identifier (e.g., "HB 123")
 * @param billTitle - The title of the bill
 * @returns A summary of the bill
 */
export async function generateBillSummary(
  billIdentifier: string,
  billTitle: string
): Promise<string> {
  try {
    console.log(`Generating summary for bill ${billIdentifier} using Claude API`);
    
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not set in environment variables');
    }

    // Direct prompt for Claude to summarize itself
    const prompt = `Generate a brief summary of ${billIdentifier}: ${billTitle}`;

    console.log('Sending request to Claude API with prompt:', prompt);
    
    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      temperature: 0.0,
      system: "You are a legislative analyst providing clear, accurate summaries of bills to help citizens understand legislation. Focus on the key points and practical impacts. Be concise but informative.",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    console.log('Received response from Claude API');
    
    // Extract the text content from the response
    if (message.content && message.content.length > 0) {
      const firstContent = message.content[0];
      if ('text' in firstContent) {
        return firstContent.text;
      }
    }
    
    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    console.error('Error generating bill summary with Claude:', error);
    return "We couldn't generate an AI summary for this bill at this time.";
  }
} 