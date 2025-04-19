import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""

    console.log(`Searching for bills with query: ${query}`)

    // Mock search results based on the query
    // In a real app, this would call the OpenStates API
    const mockResults = [
      {
        id: "hb-1082",
        identifier: "HB 1082",
        title: "Clean Energy Infrastructure Investment Act",
        jurisdiction: {
          name: "California",
        },
        session: "2023-2024",
        subjects: ["Energy", "Infrastructure", "Environment"],
      },
      {
        id: "sb-349",
        identifier: "SB 349",
        title: "Education Funding and Teacher Compensation Reform",
        jurisdiction: {
          name: "New York",
        },
        session: "2023-2024",
        subjects: ["Education", "Budget", "Labor"],
      },
    ]

    // If the query includes specific bill numbers, filter accordingly
    if (query.toLowerCase().includes("hb") && !query.toLowerCase().includes("1082")) {
      return NextResponse.json({ results: [mockResults[0]] })
    } else if (query.toLowerCase().includes("sb") && !query.toLowerCase().includes("349")) {
      return NextResponse.json({ results: [mockResults[1]] })
    }

    return NextResponse.json({ results: mockResults })
  } catch (error) {
    console.error("Bill search error:", error)
    return NextResponse.json({ error: "Failed to search bills" }, { status: 500 })
  }
}
