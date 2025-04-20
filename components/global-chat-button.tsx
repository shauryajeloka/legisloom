"use client"

import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import BillChat from "@/components/bill-chat"
import { getBill, getBillText } from "@/lib/api"

export default function GlobalChatButton() {
  const [showChat, setShowChat] = useState(false)
  const [billId, setBillId] = useState<string | null>(null)
  const [billTitle, setBillTitle] = useState("Bill Details")
  const [billContent, setBillContent] = useState("No content available.")
  const [billData, setBillData] = useState<any>(null)
  const [billIdentifier, setBillIdentifier] = useState<string | undefined>()
  const [billSession, setBillSession] = useState<string | undefined>()
  const [billJurisdiction, setBillJurisdiction] = useState<string | undefined>()
  const [billDate, setBillDate] = useState<string | undefined>()
  const [billSponsor, setBillSponsor] = useState<string | undefined>()
  const [billStatus, setBillStatus] = useState<string | undefined>()
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're on a bill page
    const billPathRegex = /\/bills\/([^/]+)/
    const match = pathname.match(billPathRegex)
    
    if (match && match[1]) {
      const id = decodeURIComponent(match[1])
      setBillId(id)
      setIsVisible(true)
      
      // Fetch bill data
      const fetchBillData = async () => {
        try {
          const bill = await getBill(id)
          if (bill) {
            // Store the complete bill data
            setBillData(bill)
            
            // Set individual fields for component state
            setBillTitle(bill.title || "Bill Details")
            setBillIdentifier(bill.identifier)
            setBillSession(bill.session)
            setBillJurisdiction(bill.jurisdiction?.name)
            setBillDate(bill.updatedAt)
            setBillSponsor(bill.primarySponsor?.name)
            
            // Determine bill status from actions if available
            if (bill.actions && bill.actions.length > 0) {
              // Get the latest action
              const latestAction = [...bill.actions].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0]
              
              // Set status based on latest action classification
              if (latestAction.classification.includes("executive-signature")) {
                setBillStatus("Signed")
              } else if (latestAction.classification.includes("passage")) {
                setBillStatus("Passed")
              } else if (latestAction.classification.includes("introduction")) {
                setBillStatus("Introduced")
              } else {
                setBillStatus(latestAction.description)
              }
            }
            
            // Create a comprehensive bill information string regardless of whether we get full text
            let comprehensiveBillInfo = `BILL INFORMATION:
`;
            comprehensiveBillInfo += `Title: ${bill.title || 'Unknown'}
`;
            comprehensiveBillInfo += `Identifier: ${bill.identifier || 'Unknown'}
`;
            comprehensiveBillInfo += `Session: ${bill.session || 'Unknown'}
`;
            comprehensiveBillInfo += `Jurisdiction: ${bill.jurisdiction?.name || 'Unknown'}
`;
            
            if (bill.primarySponsor?.name) {
              comprehensiveBillInfo += `Primary Sponsor: ${bill.primarySponsor.name}
`;
            }
            
            // Add abstract if available
            if (bill.abstract && bill.abstract.length > 0) {
              comprehensiveBillInfo += `
ABSTRACT:
${bill.abstract}
`;
            }
            
            // Add actions/history in chronological order
            if (bill.actions && bill.actions.length > 0) {
              comprehensiveBillInfo += `
LEGISLATIVE HISTORY:
`;
              
              // Sort actions by date (oldest first)
              const sortedActions = [...bill.actions].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              );
              
              sortedActions.forEach(action => {
                const date = new Date(action.date).toLocaleDateString();
                comprehensiveBillInfo += `${date}: ${action.description} `;
                if (action.classification && action.classification.length > 0) {
                  comprehensiveBillInfo += `[${action.classification.join(', ')}]`;
                }
                comprehensiveBillInfo += `
`;
              });
            }
            
            // Add votes if available
            if (bill.votes && bill.votes.length > 0) {
              comprehensiveBillInfo += `
VOTES:
`;
              bill.votes.forEach(vote => {
                const date = new Date(vote.date).toLocaleDateString();
                comprehensiveBillInfo += `${date}: Result: ${vote.result} (Yes: ${vote.counts?.yes || 0}, No: ${vote.counts?.no || 0}, Abstain: ${vote.counts?.abstain || 0})
`;
              });
            }
            
            // Set this as the default bill content
            setBillContent(comprehensiveBillInfo);
            
            // Try to get full text to append to our comprehensive info
            try {
              const text = await getBillText(id)
              if (text && text.length > 0) {
                console.log('Successfully fetched bill text, length:', text.length);
                // Append the full text to our comprehensive info
                setBillContent(prevContent => prevContent + `

FULL TEXT:
${text}`);
              }
            } catch (e) {
              console.error("Could not fetch bill text:", e);
              // We already have comprehensive info set, so no need for fallback
            }
          }
        } catch (e) {
          console.error("Error fetching bill:", e)
        }
      }
      
      fetchBillData()
    } else {
      setIsVisible(false)
    }
  }, [pathname])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showChat ? (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 z-50 max-h-[600px]">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Bill Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="h-8 w-8 p-0">
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
          <BillChat 
            billContent={billContent}
            billTitle={billTitle}
            billIdentifier={billIdentifier}
            billSession={billSession}
            billJurisdiction={billJurisdiction}
            billDate={billDate}
            billSponsor={billSponsor}
            billStatus={billStatus}
            billData={billData} // Pass the complete bill data
          />
        </div>
      ) : (
        <Button 
          onClick={() => setShowChat(true)} 
          className="rounded-full h-14 w-14 p-0 shadow-lg bg-blue-600 hover:bg-blue-700"
          aria-label="Chat with AI about this bill"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  )
}
