import FeatureCard from "@/components/feature-card"
import SearchTabs from "@/components/search-tabs"
import { FileText, Search, Lightbulb } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">Legislation Assistant</h1>
        <p className="text-gray-600 text-lg">
          Search through bills or upload legislation for AI-powered analysis and insights
        </p>
      </section>

      <div className="bg-white rounded-lg shadow-md p-6 mb-16 max-w-4xl mx-auto">
        <SearchTabs />
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-10">Powerful AI-Driven Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Bill Search"
            icon={<Search className="h-6 w-6 text-blue-600" />}
            description="Search through thousands of bills using natural language queries to find relevant legislation."
          />

          <FeatureCard
            title="Document Analysis"
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            description="Upload your documents for AI-powered analysis and get comprehensive summaries and insights."
          />

          <FeatureCard
            title="AI Insights"
            icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
            description="Leverage advanced AI models to extract key points, analyze implications, and generate recommendations."
          />
        </div>
      </section>
    </div>
  )
}
