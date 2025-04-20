"use client"

import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import BillChat from "@/components/bill-chat"

interface ChatButtonProps {
  billContent: string
  billTitle: string
}

export default function ChatButton({ billContent, billTitle }: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showChat ? (
        <BillChat billContent={billContent} billTitle={billTitle} />
      ) : (
        <Button 
          onClick={() => setShowChat(true)} 
          className="rounded-full h-14 w-14 p-0 shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  )
}
