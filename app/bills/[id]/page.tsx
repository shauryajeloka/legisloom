"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronUp, ChevronDown, FileText, CalendarIcon, Check, X, Archive } from "lucide-react"
import { format } from "date-fns"
import { getBill, getBillText, getVoteCounts, saveVoteCounts } from "@/lib/api"
import { VoteCount } from "@/lib/db"
import { BillAiSummary } from "@/components/bill-ai-summary"

// Debug logging to track component execution
console.log("Bill page component code is executing");

// Instead of Bill interface, use a simpler version
type SimpleBill = any;

// Simplified function for date formatting
const formatDate = (dateString: string | undefined) => dateString ? format(new Date(dateString), "MMM d, yyyy") : "Unknown";

export default function BillPage() {
  // Basic state setup
  const router = useRouter()
  const params = useParams()
  const [bill, setBill] = useState<SimpleBill | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Fetch bill data on component mount
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
    
    fetchBill()
  }, [params.id])
  
  // If loading, show loading UI
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
        <BillAiSummary 
          billId={bill.id}
          billTitle={bill.title}
          billIdentifier={bill.identifier}
        />
        
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
      </div>
    </div>
  )
}
