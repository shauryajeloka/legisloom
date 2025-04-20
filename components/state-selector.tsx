"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Jurisdiction {
  id: string
  name: string
  classification: string
}

export default function StateSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get("query") || ""
  const currentJurisdiction = searchParams.get("jurisdiction") || "all"
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJurisdictions() {
      try {
        // In a full implementation, you would create an API endpoint for this
        // For now, we'll just hard-code the most common states
        setJurisdictions([
          { id: "all", name: "All States", classification: "all" },
          { id: "ca", name: "California", classification: "state" },
          { id: "tx", name: "Texas", classification: "state" },
          { id: "ny", name: "New York", classification: "state" },
          { id: "fl", name: "Florida", classification: "state" },
          { id: "il", name: "Illinois", classification: "state" },
          { id: "pa", name: "Pennsylvania", classification: "state" },
          { id: "oh", name: "Ohio", classification: "state" },
          { id: "ga", name: "Georgia", classification: "state" },
          { id: "nc", name: "North Carolina", classification: "state" },
          { id: "mi", name: "Michigan", classification: "state" },
          { id: "nj", name: "New Jersey", classification: "state" },
          { id: "va", name: "Virginia", classification: "state" },
          { id: "wa", name: "Washington", classification: "state" },
          { id: "az", name: "Arizona", classification: "state" },
          { id: "ma", name: "Massachusetts", classification: "state" },
          { id: "tn", name: "Tennessee", classification: "state" },
          { id: "in", name: "Indiana", classification: "state" },
          { id: "mo", name: "Missouri", classification: "state" },
          { id: "md", name: "Maryland", classification: "state" },
          { id: "wi", name: "Wisconsin", classification: "state" },
          { id: "co", name: "Colorado", classification: "state" },
          { id: "mn", name: "Minnesota", classification: "state" },
          { id: "sc", name: "South Carolina", classification: "state" },
          { id: "al", name: "Alabama", classification: "state" },
          { id: "us", name: "Federal / Congress", classification: "country" },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching jurisdictions:", error);
        setLoading(false);
      }
    }

    fetchJurisdictions();
  }, []);

  const handleJurisdictionChange = (value: string) => {
    // Construct the new URL with the selected jurisdiction
    const params = new URLSearchParams();
    if (currentQuery) {
      params.set("query", currentQuery);
    }
    if (value && value !== "all") {
      params.set("jurisdiction", value);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="w-full mt-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Filter by State
      </label>
      <Select
        value={currentJurisdiction}
        onValueChange={handleJurisdictionChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All States" />
        </SelectTrigger>
        <SelectContent>
          {jurisdictions.map((jurisdiction) => (
            <SelectItem key={jurisdiction.id} value={jurisdiction.id}>
              {jurisdiction.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 