"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronUp, ChevronDown, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"
import BillChat from "@/components/bill-chat"
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
  }
  primarySponsor: {
    name: string
    id: string
  }
  actions: {
    date: string
    description: string
    classification: string[]
  }[]
  documents: {
    url: string
    note: string
  }[]
  votes: {
    date: string
    result: string
    counts: {
      yes: number
      no: number
      abstain: number
    }
  }[]
  versions: {
    url: string
    note: string
    date: string
  }[]
  updatedAt: string
}

// Replace the mockBills object with more realistic bills that match the API data
const mockBills = {
  "hb-1082": {
    id: "hb-1082",
    title: "Clean Energy Infrastructure Investment Act",
    identifier: "HB 1082",
    classification: ["bill"],
    subject: ["Energy", "Infrastructure", "Environment", "Public Utilities"],
    abstract:
      "This bill establishes a comprehensive framework for investing in clean energy infrastructure throughout the state. It authorizes $5 billion in bonds to fund renewable energy projects, modernize the electrical grid for resilience against climate disasters, and create incentives for private sector investment in solar, wind, and geothermal energy production. The bill requires that 40% of funds be allocated to disadvantaged communities historically affected by pollution and climate change impacts. It further mandates the creation of a Clean Energy Workforce Development Program to train workers for careers in renewable energy sectors.",
    session: "2023-2024",
    jurisdiction: {
      name: "California",
      id: "state:ca",
    },
    primarySponsor: {
      name: "Representative Maria Rodriguez",
      id: "person-123",
    },
    actions: [
      {
        date: "2023-01-14",
        description: "Introduced in House",
        classification: ["introduction", "referred-to-committee"],
      },
      {
        date: "2023-02-10",
        description: "Passed House Energy and Environment Committee",
        classification: ["committee-passage"],
      },
      {
        date: "2023-03-05",
        description: "Public hearing scheduled",
        classification: ["committee-hearing"],
      },
      {
        date: "2023-03-20",
        description: "Passed House",
        classification: ["passage"],
      },
      {
        date: "2023-04-05",
        description: "Referred to Senate Infrastructure Committee",
        classification: ["referral-committee"],
      },
    ],
    documents: [
      {
        url: "#",
        note: "Bill Text",
      },
      {
        url: "#",
        note: "Fiscal Impact Statement",
      },
      {
        url: "#",
        note: "Committee Report",
      },
    ],
    votes: [
      {
        date: "2023-02-27",
        result: "pass",
        counts: {
          yes: 12,
          no: 5,
          abstain: 1,
        },
      },
      {
        date: "2023-03-14",
        result: "pass",
        counts: {
          yes: 68,
          no: 32,
          abstain: 2,
        },
      },
    ],
    versions: [
      {
        url: "#",
        note: "Introduced Version",
        date: "2023-01-14",
      },
      {
        url: "#",
        note: "Committee Amended Version",
        date: "2023-02-27",
      },
      {
        url: "#",
        note: "Engrossed Version",
        date: "2023-03-24",
      },
    ],
    updatedAt: "2023-04-09",
  },
  "sb-349": {
    id: "sb-349",
    title: "Education Funding and Teacher Compensation Reform",
    identifier: "SB 349",
    classification: ["bill"],
    subject: ["Education", "Budget", "Labor", "Public Employment"],
    abstract:
      "This legislation represents a comprehensive reform of the state's education funding formula and teacher compensation structure. It increases the base per-pupil funding by 15% with additional weighted funding for high-need students, English language learners, and students from low-income households. The bill establishes a statewide minimum teacher salary of $60,000 with annual adjustments for inflation, creates a student loan forgiveness program for educators who commit to teaching in high-need schools for at least five years, and allocates $250 million for professional development and teacher mentorship programs. Additionally, it requires school districts to develop and implement teacher evaluation systems that incorporate multiple measures of effectiveness beyond standardized test scores.",
    session: "2023-2024",
    jurisdiction: {
      name: "New York",
      id: "state:ny",
    },
    primarySponsor: {
      name: "Senator James Williams",
      id: "person-456",
    },
    actions: [
      {
        date: "2023-01-20",
        description: "Introduced in Senate",
        classification: ["introduction"],
      },
      {
        date: "2023-02-15",
        description: "Referred to Education Committee",
        classification: ["referral-committee"],
      },
      {
        date: "2023-03-10",
        description: "Committee Hearing",
        classification: ["committee-hearing"],
      },
      {
        date: "2023-03-25",
        description: "Passed Committee",
        classification: ["committee-passage"],
      },
      {
        date: "2023-04-10",
        description: "Scheduled for Floor Vote",
        classification: ["scheduling"],
      },
    ],
    documents: [
      {
        url: "#",
        note: "Bill Text",
      },
      {
        url: "#",
        note: "Fiscal Impact Statement",
      },
      {
        url: "#",
        note: "Committee Report",
      },
    ],
    votes: [
      {
        date: "2023-03-05",
        result: "pass",
        counts: {
          yes: 8,
          no: 3,
          abstain: 0,
        },
      },
      {
        date: "2023-04-02",
        result: "pass",
        counts: {
          yes: 42,
          no: 21,
          abstain: 0,
        },
      },
    ],
    versions: [
      {
        url: "#",
        note: "Introduced Version",
        date: "2023-01-20",
      },
      {
        url: "#",
        note: "Amended Version",
        date: "2023-03-05",
      },
      {
        url: "#",
        note: "Engrossed Version",
        date: "2023-04-02",
      },
    ],
    updatedAt: "2023-04-12",
  },
  "hb-721": {
    id: "hb-721",
    title: "Healthcare Price Transparency and Patient Protection Act",
    identifier: "HB 721",
    classification: ["bill"],
    subject: ["Healthcare", "Consumer Protection", "Insurance"],
    abstract:
      "This legislation establishes comprehensive healthcare price transparency requirements for hospitals, insurance companies, and healthcare providers across the state. It mandates that all healthcare facilities publish a machine-readable file of all standard charges for items and services, including discounted cash prices and payer-specific negotiated charges. The bill requires insurance companies to provide cost estimates for common procedures through online tools accessible to patients. It prohibits surprise billing for emergency services and establishes a dispute resolution process for billing conflicts. Additionally, the legislation creates a Healthcare Price Transparency Board to oversee implementation, enforce compliance, and issue annual reports on healthcare pricing trends.",
    session: "2023-2024",
    jurisdiction: {
      name: "Illinois",
      id: "state:il",
    },
    primarySponsor: {
      name: "Representative Thomas Chen",
      id: "person-789",
    },
    actions: [
      {
        date: "2023-02-05",
        description: "Introduced in House",
        classification: ["introduction"],
      },
      {
        date: "2023-03-12",
        description: "Referred to Health and Human Services Committee",
        classification: ["referral-committee"],
      },
      {
        date: "2023-04-08",
        description: "Committee Hearing",
        classification: ["committee-hearing"],
      },
      {
        date: "2023-04-22",
        description: "Passed Committee",
        classification: ["committee-passage"],
      },
    ],
    documents: [
      {
        url: "#",
        note: "Bill Text",
      },
      {
        url: "#",
        note: "Fiscal Impact Statement",
      },
      {
        url: "#",
        note: "Committee Report",
      },
    ],
    votes: [
      {
        date: "2023-04-22",
        result: "pass",
        counts: {
          yes: 10,
          no: 6,
          abstain: 1,
        },
      },
    ],
    versions: [
      {
        url: "#",
        note: "Introduced Version",
        date: "2023-02-05",
      },
      {
        url: "#",
        note: "Committee Amended Version",
        date: "2023-04-15",
      },
    ],
    updatedAt: "2023-04-25",
  },
  "sb-514": {
    id: "sb-514",
    title: "Small Business Tax Relief and Economic Recovery Act",
    identifier: "SB 514",
    classification: ["bill"],
    subject: ["Taxation", "Economic Development", "Small Business"],
    abstract:
      "This bill provides comprehensive tax relief and economic support for small businesses across the state. It implements a temporary reduction in the small business tax rate from 6.5% to 4% for businesses with annual revenues under $5 million for the next three fiscal years. The legislation creates a $100 million Small Business Recovery Fund to provide grants ranging from $10,000 to $100,000 for qualifying small businesses that experienced revenue loss due to economic downturns. It establishes tax credits for new hires and employee retention, expands accelerated depreciation allowances for capital investments, and streamlines regulatory compliance processes for small businesses with fewer than 50 employees.",
    session: "2023-2024",
    jurisdiction: {
      name: "Texas",
      id: "state:tx",
    },
    primarySponsor: {
      name: "Senator Lisa Johnson",
      id: "person-321",
    },
    actions: [
      {
        date: "2023-01-30",
        description: "Introduced in Senate",
        classification: ["introduction"],
      },
      {
        date: "2023-02-22",
        description: "Referred to Finance Committee",
        classification: ["referral-committee"],
      },
      {
        date: "2023-03-18",
        description: "Committee Hearing",
        classification: ["committee-hearing"],
      },
      {
        date: "2023-04-01",
        description: "Passed Committee",
        classification: ["committee-passage"],
      },
      {
        date: "2023-04-15",
        description: "Passed Senate",
        classification: ["passage"],
      },
    ],
    documents: [
      {
        url: "#",
        note: "Bill Text",
      },
      {
        url: "#",
        note: "Fiscal Impact Statement",
      },
      {
        url: "#",
        note: "Committee Report",
      },
    ],
    votes: [
      {
        date: "2023-04-01",
        result: "pass",
        counts: {
          yes: 11,
          no: 2,
          abstain: 0,
        },
      },
      {
        date: "2023-04-15",
        result: "pass",
        counts: {
          yes: 22,
          no: 9,
          abstain: 0,
        },
      },
    ],
    versions: [
      {
        url: "#",
        note: "Introduced Version",
        date: "2023-01-30",
      },
      {
        url: "#",
        note: "Committee Amended Version",
        date: "2023-03-28",
      },
      {
        url: "#",
        note: "Engrossed Version",
        date: "2023-04-16",
      },
    ],
    updatedAt: "2023-04-18",
  },
}

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
      try {
        // Get the bill ID from the URL parameters
        const billId = params.id as string
        
        // Fetch the bill from our API
        const billData = await getBill(billId)
        setBill(billData)
      } catch (err) {
        console.error("Error fetching bill details:", err)
        setError("An error occurred while fetching bill details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBillData()
    }
  }, [params.id])
  
  // Function to fetch the full bill text when requested
  const handleFetchBillText = async () => {
    if (!bill) return
    
    try {
      setLoadingText(true)
      const text = await getBillText(bill.id)
      setBillContent(text)
    } catch (err) {
      console.error("Error fetching bill text:", err)
      alert("Failed to load bill text. Please try again.")
    } finally {
      setLoadingText(false)
    }
  }

  // Very simplified bill content preparation - keep it minimal
  const prepareBillContent = (bill: Bill) => {
    if (billContent) {
      return billContent;
    }
    return `Bill ${bill.identifier}: ${bill.title}. ${bill.abstract.substring(0, 300)}...`
  }

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
    )
  }

  if (error || !bill) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">{error || "Bill not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const billContent = prepareBillContent(bill)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" className="mb-4" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            {bill.jurisdiction.name}:{bill.identifier}: {bill.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-50">
              {bill.jurisdiction.name}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              Session: {bill.session}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              bill
            </Badge>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Abstract</h2>
            <p className="text-gray-700">{bill.abstract}</p>
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

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Primary Sponsor</h2>
            <p className="text-gray-700">{bill.primarySponsor.name}</p>
          </div>

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

          <div className="text-sm text-gray-500 mt-4">Last updated: {formatDate(bill.updatedAt)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Bill Versions</h2>
            <ul className="space-y-4">
              {bill.versions.map((version, index) => (
                <li key={index}>
                  <h3 className="font-medium">{version.note}</h3>
                  <p className="text-sm text-gray-600">Date: {formatDate(version.date)}</p>
                  <a href={version.url} className="text-blue-600 hover:underline text-sm">
                    Click to view
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <ul className="space-y-4">
              {bill.documents.map((document, index) => (
                <li key={index}>
                  <h3 className="font-medium">{document.note}</h3>
                  <a href={document.url} className="text-blue-600 hover:underline text-sm">
                    Click to view
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Votes</h2>
            <ul className="space-y-4">
              {bill.votes.map((vote, index) => (
                <li key={index}>
                  <h3 className="font-medium">Vote on {formatDate(vote.date)}</h3>
                  <p className="text-sm text-gray-600">Result: {vote.result}</p>
                  <p className="text-sm">
                    Yes: {vote.counts.yes} | No: {vote.counts.no} | Abstain: {vote.counts.abstain}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            className="flex items-center justify-between w-full text-xl font-semibold"
            onClick={() => setHistoryExpanded(!historyExpanded)}
          >
            <span>Bill History ({bill.actions.length} actions)</span>
            {historyExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {historyExpanded && (
            <div className="mt-4 space-y-4">
              {bill.actions.map((action, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <h3 className="font-medium">{formatDate(action.date)}</h3>
                    <div className="text-sm text-gray-600">{action.classification.join(", ")}</div>
                  </div>
                  <p className="mt-1">{action.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add the Bill Chat component with simplified content */}
      <BillChat billContent={billContent} billTitle={bill.title} />
    </div>
  )
}
