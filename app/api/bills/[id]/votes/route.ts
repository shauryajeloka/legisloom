import { NextRequest, NextResponse } from 'next/server';
import { getVoteCountsFromCache, cacheVoteCounts, VoteCount } from '@/lib/db';

// GET /api/bills/[id]/votes?voteId=123
// Retrieves vote counts for a specific vote on a bill
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the bill ID from the URL parameters
    const billId = decodeURIComponent(params.id);
    
    // Get the vote ID from the query parameters
    const { searchParams } = new URL(request.url);
    const voteId = searchParams.get('voteId');
    
    if (!voteId) {
      return NextResponse.json(
        { error: 'Vote ID is required' },
        { status: 400 }
      );
    }
    
    // Retrieve vote counts from cache
    const voteCounts = await getVoteCountsFromCache(billId, voteId);
    
    if (!voteCounts) {
      return NextResponse.json(
        { error: 'Vote counts not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ voteCounts });
  } catch (error) {
    console.error('Error retrieving vote counts:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve vote counts' },
      { status: 500 }
    );
  }
}

// POST /api/bills/[id]/votes?voteId=123
// Saves vote counts for a specific vote on a bill
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the bill ID from the URL parameters
    const billId = decodeURIComponent(params.id);
    
    // Get the vote ID from the query parameters
    const { searchParams } = new URL(request.url);
    const voteId = searchParams.get('voteId');
    
    if (!voteId) {
      return NextResponse.json(
        { error: 'Vote ID is required' },
        { status: 400 }
      );
    }
    
    // Get the vote counts from the request body
    const body = await request.json();
    
    if (!body.voteCounts || !Array.isArray(body.voteCounts)) {
      return NextResponse.json(
        { error: 'Vote counts are required and must be an array' },
        { status: 400 }
      );
    }
    
    // Validate the vote counts
    const voteCounts: VoteCount[] = body.voteCounts;
    for (const count of voteCounts) {
      if (typeof count.option !== 'string' || typeof count.value !== 'number') {
        return NextResponse.json(
          { error: 'Each vote count must have an option (string) and a value (number)' },
          { status: 400 }
        );
      }
    }
    
    // Cache the vote counts
    cacheVoteCounts(billId, voteId, voteCounts);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving vote counts:', error);
    return NextResponse.json(
      { error: 'Failed to save vote counts' },
      { status: 500 }
    );
  }
} 