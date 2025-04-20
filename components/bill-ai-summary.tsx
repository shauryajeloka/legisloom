"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AnimatedText } from "@/components/ui/animated-text";

interface BillAiSummaryProps {
  billId: string | undefined;
  billTitle: string | undefined;
  billIdentifier: string | undefined;
}

export function BillAiSummary({ billId = "", billTitle = "", billIdentifier = "" }: BillAiSummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    if (loading || !billId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Include bill details in the request
      const response = await fetch(`/api/ai-summary?billId=${encodeURIComponent(billId)}&billIdentifier=${encodeURIComponent(billIdentifier)}&billTitle=${encodeURIComponent(billTitle)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch AI summary (${response.status})`);
      }
      
      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      console.error("Error fetching AI summary:", err);
      setError(err.message || "Failed to generate AI summary");
      // Provide a fallback summary
      setSummary(`Unable to generate summary for ${billIdentifier}: ${billTitle}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch summary when component mounts
  useEffect(() => {
    if (billId && billTitle && billIdentifier) {
      // For now, we'll just set a placeholder summary that includes bill details
      setSummary(`This AI summary is analyzing ${billIdentifier}: "${billTitle}". The summary is being generated...`);
      
      // Automatically fetch the real summary
      fetchAiSummary();
    }
  }, [billId, billIdentifier, billTitle]);

  return (
    <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-center mb-3">
        <div className="w-7 h-7 mr-2 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <h2 className="text-lg font-semibold text-blue-800">AI Summary powered by Claude</h2>
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />}
      </div>
      
      {error ? (
        <div className="text-red-500 mb-2">{error}</div>
      ) : (
        <AnimatedText 
          text={summary}
          className="text-gray-700 leading-relaxed"
          speed={20}
        />
      )}
      
      <div className="mt-3 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAiSummary} 
          disabled={loading}
          className="text-xs bg-white hover:bg-blue-50"
        >
          {loading ? "Generating..." : "Regenerate Summary"}
        </Button>
      </div>
    </div>
  );
} 