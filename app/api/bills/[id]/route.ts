import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id

    console.log(`Bill Details Request for ID: ${billId}`)

    // Replace the mockBills object with more realistic bills
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
    }

    const bill = mockBills[billId as keyof typeof mockBills]

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Bill detail error:", error)
    return NextResponse.json({ error: "Failed to fetch bill details" }, { status: 500 })
  }
}
