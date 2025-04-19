"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setSummary(null)
      setError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setSummary(null)
      setError(null)
    }
  }

  const analyzeBill = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setSummary(null)
    setError(null)

    try {
      // Read the file content
      const fileContent = await readFileContent(file)

      // Call the API to summarize the bill
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: fileContent }),
      })

      const result = await response.json()

      if (result.success) {
        setSummary(result.summary || "")
      } else {
        setError(result.error || "Failed to analyze the document")
      }
    } catch (err) {
      console.error("Error analyzing document:", err)
      setError("An error occurred while analyzing the document")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error("Failed to read file"))
        }
      }

      reader.onerror = () => {
        reject(new Error("File reading error"))
      }

      if (file.type === "application/pdf") {
        // For demo purposes, we'll just use a placeholder for PDF files
        resolve("This is a placeholder for PDF content that would be extracted in a production environment.")
      } else {
        reader.readAsText(file)
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Upload Legislation</h1>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="h-16 w-16 text-blue-600 mb-4" />
              <p className="text-lg font-medium mb-2">{file.name}</p>
              <p className="text-sm text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <Button variant="outline" onClick={() => setFile(null)} className="mt-2">
                Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Drag and drop your file here</h3>
              <p className="text-sm text-gray-500 mb-4">Supports PDF, DOCX, and TXT files up to 10MB</p>
              <div className="relative">
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                />
                <Button asChild>
                  <label htmlFor="file-upload">Browse Files</label>
                </Button>
              </div>
            </>
          )}
        </div>

        {file && (
          <div className="mt-6 text-center">
            <Button className="px-8" onClick={analyzeBill} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Document"
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {summary && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">AI Summary</h2>
            <div className="p-6 bg-blue-50 rounded-lg prose max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
