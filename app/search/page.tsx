"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import SearchForm from "@/components/search-form"
import BillResultItem from "@/components/bill-result-item"
import { Loader2 } from "lucide-react"

interface Bill {
  id: string
  identifier: string
  title: string
  jurisdiction: {
    name: string
  }
  session: string
  subjects: string[]
}

// Mock search results for demonstration
const mockBills = [
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
  {
    id: "hb-721",
    identifier: "HB 721",
    title: "Healthcare Price Transparency and Patient Protection Act",
    jurisdiction: {
      name: "Illinois",
    },
    session: "2023-2024",
    subjects: ["Healthcare", "Consumer Protection"],
  },
  {
    id: "sb-514",
    identifier: "SB 514",
    title: "Small Business Tax Relief and Economic Recovery Act",
    jurisdiction: {
      name: "Texas",
    },
    session: "2023-2024",
    subjects: ["Taxation", "Economic Development", "Small Business"],
  },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query")
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function searchBills() {
      if (!query) return

      setLoading(true)
      setError(null)

      try {
        // For demonstration, we'll use mock data directly instead of API call
        // In a real app, this would be: const response = await fetch(`/api/bills/search?query=${encodeURIComponent(query)}`)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Filter mock bills based on query
        const filteredBills = mockBills.filter(
          (bill) =>
            bill.identifier.toLowerCase().includes(query.toLowerCase()) ||
            bill.title.toLowerCase().includes(query.toLowerCase()),
        )

        setBills(filteredBills)
      } catch (err) {
        console.error("Error searching bills:", err)
        setError("An error occurred while searching for bills. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    searchBills()
  }, [query])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Search Legislation</h1>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <SearchForm />

        {query && (
          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : bills.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Found {bills.length} bills</h2>
                <div className="space-y-4">
                  {bills.map((bill) => (
                    <BillResultItem key={bill.id} bill={bill} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No bills found matching "{query}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
