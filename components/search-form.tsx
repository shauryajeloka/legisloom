"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface BillSuggestion {
  id: string
  identifier: string
  title: string
}

export default function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<BillSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear the previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set a timeout to avoid making API calls on every keystroke
    if (searchQuery.trim().length > 1) {
      const timeout = setTimeout(async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/bills/search?query=${encodeURIComponent(searchQuery)}`)
          if (response.ok) {
            const data = await response.json()
            if (data.results && Array.isArray(data.results)) {
              // Limit to first 5 results for suggestions
              setSuggestions(data.results.slice(0, 5).map((bill: any) => ({
                id: bill.id,
                identifier: bill.identifier,
                title: bill.title
              })))
              setShowSuggestions(true)
            }
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error)
        } finally {
          setIsLoading(false)
        }
      }, 300)
      setTypingTimeout(timeout)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout)
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
              onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
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
