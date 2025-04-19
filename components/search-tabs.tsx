"use client"

import { useState } from "react"
import { Search, FileUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SearchForm from "@/components/search-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SearchTabs() {
  const [activeTab, setActiveTab] = useState("search")

  return (
    <Tabs defaultValue="search" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="search" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Bills
        </TabsTrigger>
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          Upload Bill
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search">
        <SearchForm />
      </TabsContent>

      <TabsContent value="upload">
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Upload your legislation document for AI-powered analysis</p>
          <Button asChild>
            <Link href="/upload">Upload Document</Link>
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
