"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

// Sample bill suggestions for autocomplete
const sampleBills = [
  { id: "hb-1082", identifier: "HB 1082", title: "Clean Energy Infrastructure Investment Act" },
  { id: "sb-349", identifier: "SB 349", title: "Education Funding and Teacher Compensation Reform" },
  { id: "hb-721", identifier: "HB 721", title: "Healthcare Price Transparency and Patient Protection Act" },
  { id: "sb-514", identifier: "SB 514", title: "Small Business Tax Relief and Economic Recovery Act" },
  { id: "hb-892", identifier: "HB 892", title: "Affordable Housing Development and Zoning Reform Act" },
]

export default function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<typeof sampleBills>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Filter suggestions based on search query
    if (searchQuery.trim().length > 0) {
      const filtered = sampleBills.filter(
        (bill) =>
          bill.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsLoading(true)
      setShowSuggestions(false)
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (billId: string) => {
    setShowSuggestions(false)
    router.push(`/bills/${billId}`)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Search for a Bill</h2>
        <p className="text-sm text-gray-600">
          Powered by{" "}
          <a href="https://openstates.org/api/" className="text-blue-600 hover:underline">
            OpenStates API
          </a>
          . Search for bills by keyword, bill number, or topic to get detailed information from state legislatures.
        </p>
        <p className="text-sm text-amber-600 italic mt-1">Note: Using mock data for demonstration purposes.</p>
      </div>

      <div className="relative">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Enter Bill Name or Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {suggestions.map((bill) => (
                  <div
                    key={bill.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(bill.id)}
                  >
                    <div className="font-medium">{bill.identifier}</div>
                    <div className="text-sm text-gray-600 truncate">{bill.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="flex-shrink-0" disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
    </div>
  )
}
