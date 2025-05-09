import { NextRequest, NextResponse } from 'next/server';
import { generateBillSummary } from '@/lib/claude';
import db from '@/lib/db';

// Cache for bill summaries
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Define the summary record type
interface SummaryRecord {
  summary: string;
  timestamp: number;
}

// Function to get a bill summary from cache
const getSummaryFromCache = (billId: string): string | null => {
  try {
    const stmt = db.prepare('SELECT summary, timestamp FROM bill_summaries WHERE id = ?');
    const result = stmt.get(billId) as SummaryRecord | undefined;
    
    if (!result) return null;
    
    // Check if cache is expired
    const now = Date.now();
    if (now - result.timestamp > CACHE_EXPIRATION) {
      // Cache expired, delete the entry
      const deleteStmt = db.prepare('DELETE FROM bill_summaries WHERE id = ?');
      deleteStmt.run(billId);
      return null;
    }
    
    return result.summary;
  } catch (error) {
    console.error('Error getting bill summary from cache:', error);
    return null;
  }
};

// Function to cache a bill summary
const cacheSummary = (billId: string, summary: string): void => {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO bill_summaries (id, summary, timestamp) VALUES (?, ?, ?)');
    stmt.run(billId, summary, Date.now());
  } catch (error) {
    console.error('Error caching bill summary:', error);
  }
};

// Ensure the table exists
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bill_summaries (
      id TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
} catch (error) {
  console.error('Error creating bill_summaries table:', error);
}

// GET /api/bills/[id]/summary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const billId = decodeURIComponent(id);
    
    console.log(`Processing summary request for bill: ${billId}`);
    
    // Check cache first
    const cachedSummary = getSummaryFromCache(billId);
    if (cachedSummary) {
      console.log(`Returning cached summary for bill: ${billId}`);
      return NextResponse.json({ summary: cachedSummary });
    }
    
    // Extract just the bill ID and title from the URL
    // Example: ocd-bill/123-abc -> "Bill 123-abc"
    const simpleBillId = billId.split('/').pop() || billId;
    const billName = `Bill ${simpleBillId}`;
    
    console.log(`Generating Claude summary for: ${billName}`);
    const summary = await generateBillSummary(billName, "");
    
    // Cache the summary
    cacheSummary(billId, summary);
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating bill summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate bill summary' },
      { status: 500 }
    );
  }
} 