"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronUp, ChevronDown, FileText, CalendarIcon, Check, X, Archive } from "lucide-react"
import { format } from "date-fns"
<<<<<<< HEAD
import { getBill, getBillText, getVoteCounts, saveVoteCounts } from "@/lib/api"
import { VoteCount } from "@/lib/db"
import { AnimatedText } from "@/components/ui/animated-text"
=======
import { getBill, getBillText } from "@/lib/api"
import ChatButton from "@/components/chat-button";
>>>>>>> 269724e (initial chatbot appearing)

// Debug logging to track component execution
console.log("Bill page component code is executing");

<<<<<<< HEAD
// Instead of Bill interface, use a simpler version
type SimpleBill = any;

// Simplified function for date formatting
const formatDate = (dateString: string | undefined) => dateString ? format(new Date(dateString), "MMM d, yyyy") : "Unknown";
=======
// Helper function to get the URL of the latest version
const getLatestVersionUrl = (bill: Bill): string | null => {
  if (bill?.versions && bill.versions.length > 0) {
    // Sort versions by date descending (assuming date format is parseable)
    const sortedVersions = [...bill.versions]
      .filter(v => v.url) // Ensure URL exists
      .sort((a, b) => {
        try {
          // Handle potential invalid date strings
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (isNaN(dateA) || isNaN(dateB)) return 0; // Don't sort if dates are invalid
          return dateB - dateA;
        } catch (e) {
          return 0;
        }
      });

    // Return the URL of the latest version if available
    if (sortedVersions.length > 0) {
      return sortedVersions[0].url;
    }
  }

  // Fallback: Use the first document URL if versions are empty or have no valid URLs
  if (bill?.documents && bill.documents.length > 0 && bill.documents[0].url) {
    return bill.documents[0].url;
  }

  return null; // Return null if no suitable URL is found
};

// Format a date string
const formatDate = (dateString: string) => {
  if (!dateString) return "Unknown date";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString; // Return original string if parsing fails
  }
};
>>>>>>> 269724e (initial chatbot appearing)

export default function BillPage() {
  // Basic state setup
  const router = useRouter()
  const params = useParams()
<<<<<<< HEAD
  const [bill, setBill] = useState<SimpleBill | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Fetch bill data on component mount
=======
  const [bill, setBill] = useState<Bill | null>(null)
  const [billText, setBillText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyExpanded, setHistoryExpanded] = useState(false)

>>>>>>> 269724e (initial chatbot appearing)
  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true)
        
        // Extract bill ID from params
        const billId = Array.isArray(params.id) ? params.id[0] : params.id;
        
        console.log("Fetching bill with ID:", billId);
        
        const data = await getBill(billId);
        console.log("Bill data received:", data);
        
        setBill(data);
      } catch (error) {
        console.error("Error fetching bill:", error);
      } finally {
        setLoading(false)
      }
    }
<<<<<<< HEAD
    
    fetchBill()
  }, [params.id])
  
  // If loading, show loading UI
=======

    fetchBillData();
  }, [params.id]);

  // Fetch full bill text when bill is loaded
  useEffect(() => {
    async function fetchText() {
      if (bill?.id) {
        try {
          const text = await getBillText(bill.id);
          setBillText(text);
        } catch (e) {
          setBillText(null); // fallback to abstract if error
        }
      }
    }
    fetchText();
  }, [bill]);
  
  // Count how many of each classification type exists in the actions
  const getStatusCounts = (bill: Bill) => {
    if (!bill?.actions) return { introduction: 0, passage: 0, signed: 0 };
    
    return bill.actions.reduce((counts, action) => {
      if (action.classification.includes("introduction")) counts.introduction++;
      if (action.classification.includes("passage")) counts.passage++;
      if (action.classification.includes("executive-signature")) counts.signed++;
      return counts;
    }, { introduction: 0, passage: 0, signed: 0 });
  };
  
  // Get the latest action of each type
  const getLatestAction = (bill: Bill, type: string) => {
    if (!bill?.actions) return null;
    
    const matching = bill.actions
      .filter(action => action.classification.includes(type))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return matching.length > 0 ? matching[0] : null;
  };

  // Get the URL for the button
  const latestVersionUrl = bill ? getLatestVersionUrl(bill) : null;

>>>>>>> 269724e (initial chatbot appearing)
  if (loading) {
    return (
      <div className="container p-8">
        <h1>Loading bill...</h1>
      </div>
    )
  }
  
  // If no bill, show error
  if (!bill) {
    return (
      <div className="container p-8">
        <h1>Bill not found</h1>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }
  
  // Render the bill page UI
  return (
    <div className="container mx-auto p-6">
      <Button className="mb-4" variant="outline" onClick={() => router.back()}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">{bill.identifier}: {bill.title}</h1>
        
        <div className="flex gap-2 mb-6">
          <Badge>{bill.jurisdiction?.name || "Unknown"}</Badge>
          <Badge>Session: {bill.session || "Unknown"}</Badge>
        </div>
        
        {/* AI Summary Section */}
        <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-3">
            <div className="w-7 h-7 mr-2 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <h2 className="text-lg font-semibold text-blue-800">AI Summary powered by Claude</h2>
          </div>
          
          <AnimatedText 
            text={`Claude, please generate a brief summary of ${bill.identifier}: ${bill.title}`}
            className="text-gray-700 leading-relaxed"
            speed={20}
          />
        </div>
        
        {/* Abstract */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Abstract</h2>
          <p>{bill.abstract}</p>
        </div>
        
        {/* Bill meta information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <ul className="space-y-2">
              {bill.primarySponsor && <li><strong>Sponsor:</strong> {bill.primarySponsor.name}</li>}
              <li><strong>Status:</strong> {bill.status || "Unknown"}</li>
              <li><strong>Introduced:</strong> {formatDate(bill.createdAt)}</li>
              <li><strong>Last Updated:</strong> {formatDate(bill.updatedAt)}</li>
            </ul>
          </div>
<<<<<<< HEAD
          
=======

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Abstract</h2>
            <p className="text-gray-700">{bill.abstract}</p>
            {latestVersionUrl && (
              <Button 
                onClick={() => {
                  console.log("Opening URL:", latestVersionUrl); // Log the URL
                  window.open(latestVersionUrl, '_blank', 'noopener,noreferrer')
                }}
                variant="outline"
                className="mt-4"
              >
                <FileText className="h-4 w-4 mr-2" /> View Full Text
              </Button>
            )}
          </div>

          {bill.primarySponsor && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Primary Sponsor</h2>
              <p className="text-gray-700">{bill.primarySponsor.name}</p>
            </div>
          )}

>>>>>>> 269724e (initial chatbot appearing)
          {bill.subject && bill.subject.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Subjects</h2>
              <div className="flex flex-wrap gap-1">
                {bill.subject.map((s: string) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Simple bill actions display */}
        {bill.actions && bill.actions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Recent Actions</h2>
            <ul className="space-y-2 border-l-2 border-gray-200 pl-4">
              {bill.actions.slice(0, 5).map((action: any, i: number) => (
                <li key={i} className="mb-2">
                  <div className="text-sm text-gray-500">{formatDate(action.date)}</div>
                  <div>{action.description}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
<<<<<<< HEAD
=======

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Legislative History</h2>
            <Button variant="ghost" onClick={() => setHistoryExpanded(!historyExpanded)}>
              {historyExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Expand
                </>
              )}
            </Button>
          </div>

          <div className={`${historyExpanded ? "" : "max-h-96 overflow-y-auto"}`}>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <ul className="space-y-6">
                {bill.actions?.map((action, index) => (
                  <li key={index} className="ml-10 relative">
                    <div className="absolute -left-6 mt-1.5 w-3 h-3 rounded-full bg-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">{formatDate(action.date)}</span>
                      <span className="font-medium">{action.description}</span>
                      {action.classification.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {action.classification.map((c) => (
                            <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                              {c.replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

>>>>>>> 269724e (initial chatbot appearing)
      </div>
      <ChatButton 
        billContent={billText || bill?.abstract || "No abstract available."}
        billTitle={bill?.title || "Bill Details"}
      />
    </div>
  )
}
