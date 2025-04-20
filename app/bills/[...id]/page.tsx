"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronUp, ChevronDown, FileText, CalendarIcon, Check, X, Archive } from "lucide-react"
import { format } from "date-fns"
import { getBill, getBillText } from "@/lib/api"

interface Bill {
  id: string
  title: string
  identifier: string
  classification: string[]
  subject: string[]
  abstract: string
  session: string
  jurisdiction: {
    name: string
    id: string
    classification?: string
  }
  primarySponsor: {
    name: string
    id: string
    classification?: string
    primary?: boolean
  } | null
  sponsors?: {
    name: string
    id: string
    classification?: string
    primary?: boolean
  }[]
  actions: {
    date: string
    description: string
    classification: string[]
  }[]
  documents: {
    note: string
    date?: string
    url: string
    links?: { url: string; text?: string }[]
  }[]
  votes: {
    date: string
    result: string
    counts: {
      yes: number
      no: number
      abstain: number
    }
    motion?: string
    organization?: string | { name: string; id?: string; [key: string]: any }
    sources?: { url: string; note?: string }[]
  }[]
  versions: {
    note: string
    date?: string
    url: string
    links?: { url: string; text?: string }[]
  }[]
  sources?: { url: string; note?: string }[]
  createdAt?: string
  updatedAt: string
  committees?: {
    id: string
    name: string | object
    chamber: string | object
    [key: string]: any
  }[]
  billTextUrl?: string
  relatedBills?: {
    identifier: string
    legislative_session: string
    relation_type: string
  }[]
  sponsorships?: {
    name: string
    id: string
    classification: string
    primary: boolean
  }[]
  
  // New fields
  otherTitles?: {
    title: string
    note?: string
  }[]
  otherIdentifiers?: {
    identifier: string
    scheme?: string
  }[]
  chamber?: string
  fromOrganization?: string | {
    id: string
    name: string
    classification: string
    [key: string]: any
  }
  latestActionDate?: string
  latestActionDescription?: string
  latestActionClassification?: string[]
  latestPassageDate?: string
  latestPassageVote?: {
    id: string
    date: string
    result: string
  }
  abstracts?: {
    abstract: string
    note?: string
  }[]
  legiscanLinkAvailable?: boolean
  legiscanLink?: string
  stateLink?: string
}

// Format a date string
const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown date";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (e) {
    return dateString; // Return original string if parsing fails
  }
};

export default function BillPage() {
  const router = useRouter()
  const params = useParams()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [billContent, setBillContent] = useState<string>("")
  const [loadingText, setLoadingText] = useState(false)

  useEffect(() => {
    async function fetchBillData() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        // Get the bill ID from the URL parameters
        const idParts = Array.isArray(params.id) ? params.id : [params.id];
        
        // For OpenStates IDs, we need to reconstruct the full ID with slashes
        const billId = idParts.join('/');
        
        console.log(`Fetching bill data for ID: ${billId}`);
        
        // Fetch the bill from our API
        const billData = await getBill(billId);
        
        if (!billData) {
          throw new Error("Bill not found");
        }
        
        console.log("Bill data received:", billData);
        setBill(billData);
      } catch (err: any) {
        console.error("Error fetching bill details:", err);
        const errorMessage = err.message || "An unknown error occurred";
        setError(`Unable to fetch bill details. ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchBillData();
  }, [params.id]);
  
  // Function to fetch the full bill text when requested
  const handleFetchBillText = async () => {
    if (!bill) return;
    
    try {
      setLoadingText(true);
      const text = await getBillText(bill.id);
      setBillContent(text);
    } catch (err: any) {
      console.error("Error fetching bill text:", err);
      const errorMessage = err.message || "Unknown error";
      setBillContent(`Failed to load bill text: ${errorMessage}`);
    } finally {
      setLoadingText(false);
    }
  };
  
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse flex flex-col w-full max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">{error || "Bill not found"}</p>
          {error && error.includes("Rate limit") && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-md">
              <p>The OpenStates API has a rate limit that has been reached.</p>
              <p className="text-sm mt-2">
                You can try again in a few minutes, or consider signing up for an OpenStates API key at{" "}
                <a 
                  href="https://openstates.org/api/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://openstates.org/api/
                </a>
              </p>
            </div>
          )}
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  const statusCounts = getStatusCounts(bill);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" className="mb-4" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold mb-4 flex-1">
              {bill.identifier}: {bill.title}
            </h1>
          </div>

          {bill.otherTitles && bill.otherTitles.length > 0 && (
            <div className="mb-4 text-gray-600 italic">
              <p className="text-sm font-medium">Also known as:</p>
              <ul className="list-disc pl-5">
                {bill.otherTitles.map((title, idx) => (
                  <li key={idx}>{title.title} {title.note && <span className="text-xs">({title.note})</span>}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-50">
              {bill.jurisdiction.name}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              Session: {bill.session}
            </Badge>
            {bill.chamber && (
              <Badge variant="outline" className="bg-blue-50">
                Chamber: {bill.chamber}
              </Badge>
            )}
            {bill.classification && bill.classification.map((c) => (
              <Badge key={c} variant="outline" className="bg-blue-50">
                {c}
              </Badge>
            ))}
          </div>
          
          {/* Latest action */}
          {bill.latestActionDescription && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="font-semibold text-sm">Latest Action ({formatDate(bill.latestActionDate)}):</p>
              <p className="mt-1">{bill.latestActionDescription}</p>
              {bill.latestActionClassification && bill.latestActionClassification.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {bill.latestActionClassification.map((c, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 rounded-full text-blue-800">
                      {c.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* External links */}
          <div className="flex flex-wrap gap-2 mb-4">
            {bill.stateLink && (
              <a 
                href={bill.stateLink} 
                className="text-sm text-blue-600 hover:underline flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4 mr-1" /> Official State Page
              </a>
            )}
            {bill.legiscanLink && (
              <a 
                href={bill.legiscanLink} 
                className="text-sm text-blue-600 hover:underline flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4 mr-1" /> LegiScan
              </a>
            )}
            {bill.billTextUrl && (
              <a 
                href={bill.billTextUrl} 
                className="text-sm text-blue-600 hover:underline flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-4 w-4 mr-1" /> Bill Text
              </a>
            )}
          </div>
          
          {/* Bill Status Timeline */}
          <div className="my-6 py-4 border-t border-b">
            <h2 className="text-xl font-semibold mb-4">Bill Status</h2>
            <div className="flex items-center justify-between text-sm">
              <div className={`flex flex-col items-center ${statusCounts.introduction > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${statusCounts.introduction > 0 ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>Introduced</div>
                {getLatestAction(bill, 'introduction') && (
                  <div className="text-xs mt-1">{formatDate(getLatestAction(bill, 'introduction')?.date || '')}</div>
                )}
              </div>
              
              <div className={`w-full mx-2 h-1 ${statusCounts.passage > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              
              <div className={`flex flex-col items-center ${statusCounts.passage > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${statusCounts.passage > 0 ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Check className="h-5 w-5" />
                </div>
                <div>Passed</div>
                {getLatestAction(bill, 'passage') && (
                  <div className="text-xs mt-1">{formatDate(getLatestAction(bill, 'passage')?.date || '')}</div>
                )}
              </div>
              
              <div className={`w-full mx-2 h-1 ${statusCounts.signed > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              
              <div className={`flex flex-col items-center ${statusCounts.signed > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${statusCounts.signed > 0 ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Archive className="h-5 w-5" />
                </div>
                <div>Signed</div>
                {getLatestAction(bill, 'executive-signature') && (
                  <div className="text-xs mt-1">{formatDate(getLatestAction(bill, 'executive-signature')?.date || '')}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Abstract</h2>
            
            {bill.abstracts && bill.abstracts.length > 0 ? (
              <div>
                {bill.abstracts.map((abstract, idx) => (
                  <div key={idx} className={idx > 0 ? "mt-4 pt-4 border-t" : ""}>
                    {abstract.note && <p className="text-sm text-gray-500 mb-1">{abstract.note}:</p>}
                    <p className="text-gray-700">{abstract.abstract}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">{bill.abstract}</p>
            )}
            
            <Button
              onClick={handleFetchBillText}
              className="mt-4 flex items-center gap-2"
              disabled={loadingText}
            >
              <FileText className="h-4 w-4" />
              {loadingText ? "Loading..." : billContent ? "View Updated Text" : "View Full Text"}
            </Button>
            {billContent && (
              <div className="mt-4 p-4 border rounded bg-gray-50 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{billContent}</pre>
              </div>
            )}
          </div>

          {bill.primarySponsor && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Primary Sponsor</h2>
              <p className="text-gray-700">{bill.primarySponsor.name}</p>
              {bill.primarySponsor.classification && (
                <p className="text-gray-500 text-sm">{bill.primarySponsor.classification}</p>
              )}
            </div>
          )}

          {bill.sponsors && bill.sponsors.length > 1 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Co-Sponsors</h2>
              <ul className="space-y-1">
                {bill.sponsors.filter(s => !s.primary).map((sponsor, idx) => (
                  <li key={idx} className="text-gray-700">
                    {sponsor.name}
                    {sponsor.classification && (
                      <span className="text-gray-500 text-sm ml-2">({sponsor.classification})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bill.committees && bill.committees.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Committees</h2>
              <ul className="space-y-1">
                {bill.committees.map((committee, idx) => (
                  <li key={idx} className="text-gray-700">
                    {typeof committee.name === 'string' ? committee.name : JSON.stringify(committee.name)}
                    <span className="text-gray-500 text-sm ml-2">({typeof committee.chamber === 'string' ? committee.chamber : JSON.stringify(committee.chamber)})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bill.subject && bill.subject.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {bill.subject.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {bill.relatedBills && bill.relatedBills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Related Bills</h2>
              <ul className="space-y-1">
                {bill.relatedBills.map((relatedBill, idx) => (
                  <li key={idx} className="text-gray-700">
                    {relatedBill.identifier} 
                    <span className="text-gray-500 text-sm ml-2">
                      ({relatedBill.relation_type}, Session: {relatedBill.legislative_session})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bill.fromOrganization && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">From Organization</h2>
              <p className="text-gray-700">{typeof bill.fromOrganization === 'string' ? bill.fromOrganization : bill.fromOrganization.name || 'Unknown organization'}</p>
              {typeof bill.fromOrganization !== 'string' && bill.fromOrganization.classification && (
                <p className="text-gray-500 text-sm">{bill.fromOrganization.classification}</p>
              )}
            </div>
          )}

          {bill.otherIdentifiers && bill.otherIdentifiers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Other Identifiers</h2>
              <div className="space-y-1">
                {bill.otherIdentifiers.map((id, idx) => (
                  <p key={idx} className="text-gray-700">
                    {id.identifier}
                    {id.scheme && <span className="text-gray-500 text-sm ml-2">({id.scheme})</span>}
                  </p>
                ))}
              </div>
            </div>
          )}

          {bill.sources && bill.sources.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
              <ul className="space-y-2">
                {bill.sources.map((source, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <a 
                      href={source.url}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.note || `Source ${idx + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                Data provided by OpenStates API. Last updated: {formatDate(bill.updatedAt)}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-500 mt-4">Last updated: {formatDate(bill.updatedAt)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {bill.versions && bill.versions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Bill Versions</h2>
              <ul className="space-y-4">
                {bill.versions.map((version, index) => (
                  <li key={index} className="border-b pb-3 last:border-b-0">
                    <h3 className="font-medium">{version.note}</h3>
                    {version.date && (
                      <p className="text-sm text-gray-600">Date: {formatDate(version.date)}</p>
                    )}
                    {version.links && version.links.length > 0 ? (
                      <div className="mt-1">
                        {version.links.map((link, linkIdx) => (
                          <a 
                            key={linkIdx}
                            href={link.url} 
                            className="text-blue-600 hover:underline text-sm block" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {link.text || "View Document"}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a 
                        href={version.url} 
                        className="text-blue-600 hover:underline text-sm" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View Document
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bill.documents && bill.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Documents</h2>
              <ul className="space-y-4">
                {bill.documents.map((document, index) => (
                  <li key={index} className="border-b pb-3 last:border-b-0">
                    <h3 className="font-medium">{document.note}</h3>
                    {document.date && (
                      <p className="text-sm text-gray-600">Date: {formatDate(document.date)}</p>
                    )}
                    {document.links && document.links.length > 0 ? (
                      <div className="mt-1">
                        {document.links.map((link, linkIdx) => (
                          <a 
                            key={linkIdx}
                            href={link.url} 
                            className="text-blue-600 hover:underline text-sm block" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {link.text || "View Document"}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a 
                        href={document.url} 
                        className="text-blue-600 hover:underline text-sm" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View Document
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {bill.votes && bill.votes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Votes</h2>
            <div className="space-y-6">
              {bill.votes.map((vote, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">{formatDate(vote.date)}</p>
                      {vote.motion && (
                        <p className="text-sm text-gray-600">{vote.motion}</p>
                      )}
                      {vote.organization && (
                        <p className="text-sm text-gray-600">By: {typeof vote.organization === 'string' ? vote.organization : vote.organization.name || 'Unknown organization'}</p>
                      )}
                    </div>
                    <Badge variant={vote.result === "pass" ? "default" : "destructive"}>
                      {vote.result === "pass" ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="bg-green-50 p-3 rounded text-center">
                      <div className="text-lg font-semibold text-green-600">{vote.counts.yes}</div>
                      <div className="text-xs text-gray-600">Yes</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded text-center">
                      <div className="text-lg font-semibold text-red-600">{vote.counts.no}</div>
                      <div className="text-xs text-gray-600">No</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-center">
                      <div className="text-lg font-semibold text-gray-600">{vote.counts.abstain}</div>
                      <div className="text-xs text-gray-600">Abstain</div>
                    </div>
                  </div>
                  {vote.sources && vote.sources.length > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="text-gray-500">Sources:</p>
                      {vote.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.url}
                          className="text-blue-600 hover:underline mr-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.note || `Source ${idx + 1}`}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>
    </div>
  )
} 