/**
 * API client for interacting with the Python FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

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
  pagination: {
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
  
  const url = `${API_BASE_URL}/bills?${queryParams.toString()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching bills: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Search for bills by keyword
 */
export async function searchBills(query: string): Promise<BillSearchResult> {
  const url = `${API_BASE_URL}/bills/search?query=${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error searching bills: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Get a specific bill by ID
 */
export async function getBill(billId: string): Promise<Bill> {
  const url = `${API_BASE_URL}/bills/${billId}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching bill: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Get the full text of a bill
 */
export async function getBillText(billId: string): Promise<string> {
  const url = `${API_BASE_URL}/bills/${billId}/text`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching bill text: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.text;
}

/**
 * Get AI-generated analysis of a bill
 */
export async function getBillAnalysis(billId: string): Promise<{ summary: string; keywords: string[] }> {
  const url = `${API_BASE_URL}/bills/${billId}/analysis`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error fetching bill analysis: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Chat with a bill (ask a question about it)
 */
export async function chatWithBill(request: ChatRequest): Promise<ChatResponse> {
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
}
