import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id
    console.log(`Bill Details Request for ID: ${billId}`)

    // Try to fetch from OpenStates API
    const apiKey = process.env.OPENSTATES_API_KEY

    if (apiKey) {
      try {
        console.log(`Attempting to fetch bill ${billId} from OpenStates API`)
        const openstatesUrl = `https://v3.openstates.org/bills/${billId}`
        
        const response = await fetch(openstatesUrl, {
          headers: {
            "X-API-KEY": apiKey
          },
          // Include next parameter in the URL as an alternative way to authenticate
          // It might not work this way, but trying both methods
          // next: { revalidate: 3600 }
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`Successfully fetched bill from OpenStates API`)
          
          // Transform the OpenStates data to our format
          const transformedBill = {
            id: data.id,
            title: data.title,
            identifier: data.identifier,
            classification: data.classification || [],
            subject: data.subject || [],
            abstract: data.abstract || "No abstract available",
            session: data.session,
            jurisdiction: {
              name: data.jurisdiction?.name || "Unknown",
              id: data.jurisdiction?.id || "unknown"
            },
            primarySponsor: data.sponsors && data.sponsors.length > 0 ? {
              name: data.sponsors[0].name,
              id: data.sponsors[0].id
            } : {
              name: "Unknown",
              id: "unknown"
            },
            actions: data.actions || [],
            documents: data.documents || [],
            votes: data.votes || [],
            versions: data.versions || [],
            updatedAt: data.updated_at || new Date().toISOString()
          }
          
          return NextResponse.json({ bill: transformedBill })
        } else {
          console.log(`OpenStates API returned an error: ${response.status}`)
          // Fall through to mock data
        }
      } catch (apiError) {
        console.error("Error fetching from OpenStates API:", apiError)
        // Fall through to mock data
      }
    }

    // If we couldn't fetch from the API, use mock data
    console.log(`Using mock data for bill ${billId}`)
    
    // Create an extended mockBills object with our new IDs from the search
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
      "us-117-hr-1968": {
        id: "us-117-hr-1968",
        title: "Veteran Deportation Prevention and Reform Act",
        identifier: "H.R. 1968",
        classification: ["bill"],
        subject: ["Veterans", "Immigration", "Armed Forces"],
        abstract:
          "This bill addresses the deportation of noncitizen members of the Armed Forces. Specifically, it establishes a program to prevent the deportation of certain veterans, creates a path to citizenship for those who have been deported, and ensures access to medical care for veterans regardless of their immigration status.",
        session: "117",
        jurisdiction: {
          name: "United States",
          id: "ocd-jurisdiction/country:us/government",
        },
        primarySponsor: {
          name: "Representative Mark Takano",
          id: "person-789",
        },
        actions: [
          {
            date: "2021-03-17",
            description: "Introduced in House",
            classification: ["introduction"],
          },
          {
            date: "2021-04-20",
            description: "Referred to the Committee on Veterans' Affairs, and in addition to the Committees on the Judiciary, and Armed Services",
            classification: ["referral-committee"],
          },
          {
            date: "2021-06-15",
            description: "Subcommittee Hearings Held",
            classification: ["committee-hearing"],
          },
          {
            date: "2021-09-22",
            description: "Ordered to be Reported",
            classification: ["committee-passage"],
          }
        ],
        documents: [
          {
            url: "#",
            note: "Bill Text",
          },
          {
            url: "#",
            note: "Committee Report",
          }
        ],
        votes: [
          {
            date: "2021-09-22",
            result: "pass",
            counts: {
              yes: 14,
              no: 9,
              abstain: 0,
            },
          }
        ],
        versions: [
          {
            url: "#",
            note: "Introduced",
            date: "2021-03-17",
          },
          {
            url: "#",
            note: "Reported by Committee",
            date: "2021-09-22",
          }
        ],
        updatedAt: "2023-05-15",
      },
      "us-117-hr-3076": {
        id: "us-117-hr-3076",
        title: "Postal Service Reform Act of 2022",
        identifier: "H.R. 3076",
        classification: ["bill"],
        subject: ["Government operations and politics", "Postal service"],
        abstract:
          "This bill makes various changes to the finances and operations of the United States Postal Service (USPS). It eliminates the requirement that the USPS pre-fund retiree health benefits, requires postal employees to enroll in Medicare, and requires the USPS to maintain a six-day delivery schedule. The bill also requires the USPS to establish a public dashboard for tracking performance and service standards.",
        session: "117",
        jurisdiction: {
          name: "United States",
          id: "ocd-jurisdiction/country:us/government",
        },
        primarySponsor: {
          name: "Representative Carolyn B. Maloney",
          id: "person-012",
        },
        actions: [
          {
            date: "2021-05-11",
            description: "Introduced in House",
            classification: ["introduction"],
          },
          {
            date: "2022-02-08",
            description: "Passed House",
            classification: ["passage"],
          },
          {
            date: "2022-03-08",
            description: "Passed Senate",
            classification: ["passage"],
          },
          {
            date: "2022-04-06",
            description: "Signed by President",
            classification: ["executive-signature"],
          }
        ],
        documents: [
          {
            url: "#",
            note: "Bill Text",
          },
          {
            url: "#",
            note: "Fiscal Impact Statement",
          }
        ],
        votes: [
          {
            date: "2022-02-08",
            result: "pass",
            counts: {
              yes: 342,
              no: 92,
              abstain: 0,
            },
          },
          {
            date: "2022-03-08",
            result: "pass",
            counts: {
              yes: 79,
              no: 19,
              abstain: 2,
            },
          }
        ],
        versions: [
          {
            url: "#",
            note: "Introduced",
            date: "2021-05-11",
          },
          {
            url: "#",
            note: "Enrolled",
            date: "2022-03-15",
          }
        ],
        updatedAt: "2023-04-22",
      },
      "ca-20232024-ab-1078": {
        id: "ca-20232024-ab-1078",
        title: "Academic Freedom to Teach and Learn Act",
        identifier: "AB 1078",
        classification: ["bill"],
        subject: ["Education", "Civil Rights"],
        abstract:
          "This bill establishes academic freedom protections for California public school teachers and students. It prohibits school districts from banning instructional materials based solely on their inclusion of contributions by individuals from protected classes. The bill also creates provisions for curriculum transparency and parental involvement in educational content discussions.",
        session: "20232024",
        jurisdiction: {
          name: "California",
          id: "ocd-jurisdiction/country:us/state:ca/government",
        },
        primarySponsor: {
          name: "Assemblymember Corey Jackson",
          id: "person-567",
        },
        actions: [
          {
            date: "2023-02-14",
            description: "Introduced",
            classification: ["introduction"],
          },
          {
            date: "2023-04-26",
            description: "Passed Education Committee",
            classification: ["committee-passage"],
          },
          {
            date: "2023-05-18",
            description: "Passed Appropriations Committee",
            classification: ["committee-passage"],
          },
          {
            date: "2023-05-31",
            description: "Passed Assembly",
            classification: ["passage"],
          },
          {
            date: "2023-09-08",
            description: "Passed Senate",
            classification: ["passage"],
          },
          {
            date: "2023-10-13",
            description: "Signed by Governor",
            classification: ["executive-signature"],
          }
        ],
        documents: [
          {
            url: "#",
            note: "Bill Text",
          },
          {
            url: "#",
            note: "Analysis",
          }
        ],
        votes: [
          {
            date: "2023-05-31",
            result: "pass",
            counts: {
              yes: 43,
              no: 16,
              abstain: 0,
            },
          },
          {
            date: "2023-09-08",
            result: "pass",
            counts: {
              yes: 30,
              no: 9,
              abstain: 1,
            },
          }
        ],
        versions: [
          {
            url: "#",
            note: "Introduced",
            date: "2023-02-14",
          },
          {
            url: "#",
            note: "Amended",
            date: "2023-04-20",
          },
          {
            url: "#",
            note: "Chaptered",
            date: "2023-10-13",
          }
        ],
        updatedAt: "2023-10-17",
      }
    }

    // Try to find the bill by OpenStates ID format first
    const bill = mockBills[billId] || findBillByOpenstatesId(billId, mockBills)

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ bill })
  } catch (error) {
    console.error("Error fetching bill:", error)
    return NextResponse.json({ error: "Failed to fetch bill details" }, { status: 500 })
  }
}

// Helper function to find a bill by its OpenStates ID format
function findBillByOpenstatesId(openstatesId: string, mockBills: any) {
  // Look for exact match first
  for (const key in mockBills) {
    if (mockBills[key].id === openstatesId) {
      return mockBills[key]
    }
  }
  
  // If not found, try to extract identifier parts and match
  // OpenStates IDs often include jurisdiction, session, and bill identifier
  // Example: ocd-bill/12fcda7f-b695-44a4-b508-5d5da4f5e070
  // or us-117-hr-1968
  
  // Just return the first mock bill for demo purposes
  // In a real implementation, we would parse the ID and match accordingly
  const allBills = Object.values(mockBills)
  if (allBills.length > 0) {
    return allBills[0]
  }
  
  return null
}

// API endpoint to get bill text
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id
    
    // In a real implementation, we would fetch the actual bill text
    // For demo purposes, return mock text
    const mockText = `
# ${billId.toUpperCase()} - Sample Bill Text

## SECTION 1. SHORT TITLE
This Act may be cited as the "${billId.toUpperCase()} Sample Bill Act of 2023".

## SECTION 2. FINDINGS
Congress finds the following:
(1) This is sample text for demonstration purposes.
(2) In a real implementation, this would contain the actual bill text.
(3) The text would be fetched from the OpenStates API or other legislative sources.

## SECTION 3. DEFINITIONS
In this Act:
(1) TERM.—The term "term" means a word or phrase used to describe a thing or to express a concept.
(2) DEFINITION.—The term "definition" means a statement of the meaning of a term.

## SECTION 4. IMPLEMENTATION
(a) IN GENERAL.—The Secretary shall implement the provisions of this Act.
(b) TIMELINE.—Implementation shall begin not later than 180 days after the date of enactment of this Act.

## SECTION 5. AUTHORIZATION OF APPROPRIATIONS
There are authorized to be appropriated such sums as may be necessary to carry out this Act.
`
    
    return NextResponse.json({ text: mockText })
  } catch (error) {
    console.error("Error fetching bill text:", error)
    return NextResponse.json({ error: "Failed to fetch bill text" }, { status: 500 })
  }
}
