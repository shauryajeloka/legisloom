"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import SearchForm from "@/components/search-form"
import StateSelector from "@/components/state-selector"
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
  subjects?: string[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const jurisdiction = searchParams.get("jurisdiction") || ""
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function searchBills() {
      // Only search if we have a query or a jurisdiction that's not "all"
      if (!query && (!jurisdiction || jurisdiction === "all")) return

      setLoading(true)
      setError(null)

      try {
        // Build the API URL with query parameters
        const params = new URLSearchParams()
        if (query) params.append("query", query)
        if (jurisdiction && jurisdiction !== "all") params.append("jurisdiction", jurisdiction)
        
        // Call our API endpoint to search for bills
        const response = await fetch(`/api/bills/search?${params.toString()}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'An error occurred while searching for bills')
        }

        const data = await response.json()
        setBills(data.results || [])
      } catch (err) {
        console.error("Error searching bills:", err)
        setError(err instanceof Error ? err.message : "An error occurred while searching for bills. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    searchBills()
  }, [query, jurisdiction])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Search Legislation</h1>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <SearchForm />
        <StateSelector />

        {(query || (jurisdiction && jurisdiction !== "all")) && (
          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : bills.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Found {bills.length} bills
                  {jurisdiction && jurisdiction !== "all" && ` in ${bills[0]?.jurisdiction?.name || jurisdiction}`}
                  {query && ` matching "${query}"`}
                </h2>
                <div className="space-y-4">
                  {bills.map((bill) => (
                    <BillResultItem key={bill.id} bill={bill} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No bills found
                {query && ` matching "${query}"`}
                {jurisdiction && jurisdiction !== "all" && ` in the selected jurisdiction`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
