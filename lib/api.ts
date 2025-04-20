/**
 * API client for interacting with the legislative bills API
 */

// Use relative paths for Next.js API routes instead of localhost
const API_BASE_URL = '/api';

import { VoteCount } from './db';

export interface Bill {
  id: string;
  title: string;
  identifier: string;
  classification: string[];
  subject: string[];
  abstract: string;
  session: string;
  jurisdiction: {
    name: string;
    id: string;
  };
  primarySponsor: {
    name: string;
    id: string;
  } | null;
  actions: {
    date: string;
    description: string;
    classification: string[];
  }[];
  documents: {
    url: string;
    note: string;
  }[];
  votes: {
    date: string;
    result: string;
    counts: {
      yes: number;
      no: number;
      abstain: number;
    };
  }[];
  versions: {
    url: string;
    note: string;
    date: string;
  }[];
  updatedAt: string;
  keywords?: string[];
  summary?: string;
}

export interface BillSearchResult {
  results: Bill[];
  pagination?: {
    total_items: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface ChatRequest {
  bill_id: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  bill_title?: string;
}

/**
 * Get a list of bills with optional filtering
 */
export async function getBills(params: {
  jurisdiction?: string;
  session?: string;
  subject?: string;
  page?: number;
  per_page?: number;
}): Promise<BillSearchResult> {
  const queryParams = new URLSearchParams();
  
  if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
  if (params.session) queryParams.append('session', params.session);
  if (params.subject) queryParams.append('subject', params.subject);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.per_page) queryParams.append('per_page', params.per_page.toString());
  
  try {
    const url = `${API_BASE_URL}/bills/search?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching bills: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching bills:', error);
    return { results: [] };
  }
}

/**
 * Search for bills by keyword
 */
export async function searchBills(query: string, jurisdiction?: string): Promise<BillSearchResult> {
  const queryParams = new URLSearchParams();
  queryParams.append('query', query);
  if (jurisdiction && jurisdiction !== 'all') {
    queryParams.append('jurisdiction', jurisdiction);
  }
  
  try {
    const url = `${API_BASE_URL}/bills/search?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error searching bills: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching bills:', error);
    return { results: [] };
  }
}

/**
 * Get a specific bill by ID
 */
export async function getBill(billId: string): Promise<Bill | null> {
  try {
    // For OpenStates IDs with slashes (ocd-bill/xxx), we need to properly encode the ID
    const encodedBillId = encodeURIComponent(billId);
    const url = `${API_BASE_URL}/bills/${encodedBillId}`;
    
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || response.statusText || 'Unknown error';
      throw new Error(`Error fetching bill: ${errorMessage}`);
    }
    
    const data = await response.json();
    
    if (!data.bill) {
      throw new Error("No bill data returned from API");
    }
    
    return data.bill;
  } catch (error) {
    console.error(`Error fetching bill ${billId}:`, error);
    throw error; // Re-throw the error so the component can handle it
  }
}

/**
 * Get the full text of a bill
 */
export async function getBillText(billId: string): Promise<string> {
  try {
    // For OpenStates IDs with slashes (ocd-bill/xxx), we need to properly encode the ID
    const encodedBillId = encodeURIComponent(billId);
    const url = `${API_BASE_URL}/bills/${encodedBillId}`;
    
    console.log(`Making bill text API request to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || response.statusText || 'Unknown error';
      throw new Error(`Error fetching bill text: ${errorMessage}`);
    }
    
    const data = await response.json();
    
    if (!data.text) {
      throw new Error("No bill text available");
    }
    
    return data.text;
  } catch (error) {
    console.error(`Error fetching bill text for ${billId}:`, error);
    throw error; // Re-throw so the component can handle it
  }
}

/**
 * Get AI-generated analysis of a bill
 */
export async function getBillAnalysis(billId: string): Promise<{ summary: string; keywords: string[] }> {
  try {
    // For now, return mock data since we don't have an analysis endpoint
    return {
      summary: "This is a mock bill summary. In a production environment, this would be generated by an AI analysis of the bill text.",
      keywords: ["mock", "sample", "example", "legislation"]
    };
  } catch (error) {
    console.error(`Error fetching bill analysis for ${billId}:`, error);
    return {
      summary: "Unable to generate summary at this time.",
      keywords: []
    };
  }
}

/**
 * Chat with a bill (ask a question about it)
 */
export async function chatWithBill(request: ChatRequest): Promise<ChatResponse> {
  try {
    const url = `${API_BASE_URL}/chat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Error chatting with bill: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error chatting with bill:', error);
    return {
      answer: "I'm sorry, I couldn't process your question at this time. Please try again later."
    };
  }
}

// Gets vote counts for a specific vote on a bill
export async function getVoteCounts(billId: string, voteId: string): Promise<VoteCount[]> {
  try {
    const response = await fetch(`/api/bills/${encodeURIComponent(billId)}/votes?voteId=${encodeURIComponent(voteId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch vote counts');
    }

    const data = await response.json();
    return data.voteCounts;
  } catch (error) {
    console.error('Error fetching vote counts:', error);
    return [];
  }
}

// Saves vote counts for a specific vote on a bill
export async function saveVoteCounts(billId: string, voteId: string, voteCounts: VoteCount[]): Promise<boolean> {
  try {
    const response = await fetch(`/api/bills/${encodeURIComponent(billId)}/votes?voteId=${encodeURIComponent(voteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ voteCounts })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save vote counts');
    }

    return true;
  } catch (error) {
    console.error('Error saving vote counts:', error);
    return false;
  }
}

/**
 * Get an AI-generated summary of a bill
 */
export async function getBillSummary(billId: string): Promise<string> {
  try {
    // For OpenStates IDs with slashes (ocd-bill/xxx), we need to properly encode the ID
    const encodedBillId = encodeURIComponent(billId);
    
    // Use absolute URL format for fetch
    const url = `${API_BASE_URL}/bills/${encodedBillId}/summary`;
    
    console.log(`Making bill summary API request to: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || response.statusText || 'Unknown error';
      throw new Error(`Error fetching bill summary: ${errorMessage}`);
    }
    
    const data = await response.json();
    
    if (!data.summary) {
      throw new Error("No summary available");
    }
    
    return data.summary;
  } catch (error) {
    console.error(`Error fetching bill summary for ${billId}:`, error);
    return "Unable to generate a summary at this time.";
  }
}
