"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, X, MessageSquare, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface BillChatProps {
  billContent: string
  billTitle: string
  billIdentifier?: string
  billSession?: string
  billJurisdiction?: string
  billDate?: string
  billSponsor?: string
  billStatus?: string
  billData?: any // Complete bill data object
}

export default function BillChat({ 
  billContent, 
  billTitle, 
  billIdentifier, 
  billSession, 
  billJurisdiction, 
  billDate, 
  billSponsor, 
  billStatus,
  billData
}: BillChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your legislative assistant. I can answer questions about:

**${billTitle}**${billIdentifier ? ` (${billIdentifier})` : ''}
${billJurisdiction ? `Jurisdiction: ${billJurisdiction}` : ''}${billSession ? `, Session: ${billSession}` : ''}
${billSponsor ? `Primary Sponsor: ${billSponsor}` : ''}
${billStatus ? `Current Status: ${billStatus}` : ''}

What would you like to know about this bill?`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Sanitize and prepare bill content for API
  const prepareBillContent = (content: string): string => {
    // If content is empty or very short, create a structured representation
    if (!content || content.trim().length < 50) {
      console.log('Bill content is empty or very short, creating structured content');
      
      let structuredContent = '';
      
      // Add basic metadata
      structuredContent += `BILL INFORMATION:
`;
      if (billTitle) structuredContent += `Title: ${billTitle}
`;
      if (billIdentifier) structuredContent += `Identifier: ${billIdentifier}
`;
      if (billJurisdiction) structuredContent += `Jurisdiction: ${billJurisdiction}
`;
      if (billSession) structuredContent += `Session: ${billSession}
`;
      if (billSponsor) structuredContent += `Primary Sponsor: ${billSponsor}
`;
      if (billStatus) structuredContent += `Current Status: ${billStatus}
`;
      if (billDate) structuredContent += `Last Updated: ${billDate}
`;
      
      return structuredContent;
    }
    
    // Limit content length to prevent issues with API
    const maxLength = 1000
    let sanitized = content

    // Remove any problematic characters
    sanitized = sanitized.replace(/[^\w\s.,;:'"()[\]{}\-!?@#$%^&*+=]/g, " ")

    // Truncate if too long
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + "..."
    }

    return sanitized
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    setIsLoading(true)
    try {
      // Prepare bill content
      const preparedBillContent = prepareBillContent(billContent)

      // Create a structured bill info object for debugging
      const billInfo = {
        billContent: preparedBillContent,
        billTitle,
        billIdentifier,
        billSession,
        billJurisdiction,
        billDate,
        billSponsor,
        billStatus,
        completeBillData: billData // Include the complete bill data
      };
      
      console.log('Sending bill info to API:', billInfo);
      
      // Call the API to get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billContent: preparedBillContent,
          billTitle,
          billIdentifier,
          billSession,
          billJurisdiction,
          billDate,
          billSponsor,
          billStatus,
          completeBillData: billData, // Send the complete bill data to the API
          userMessage: userMessage.substring(0, 500), // Limit user message length
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`API error: ${response.status}`, errorText)
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.message || "" }])
        // Reset retry count on success
        setRetryCount(0)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.error || "I'm sorry, I couldn't process your request.",
          },
        ])
      }
    } catch (error) {
      console.error("Chat error:", error)

      // Add a system message about the error
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "There was an error connecting to the AI service.",
        },
      ])

      // If we've had multiple failures, provide a more helpful message
      if (retryCount >= 2) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm experiencing technical difficulties. Please try asking a simpler question or try again later.",
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm sorry, I couldn't process your question. Please try again with a simpler query.",
          },
        ])
        // Increment retry count
        setRetryCount((prev) => prev + 1)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg">
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 z-50 max-h-[600px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Bill Assistant</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : message.role === "system" ? "justify-center" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : message.role === "system"
                    ? "bg-amber-100 text-amber-800 flex items-center"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.role === "system" && <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />}
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this bill..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
