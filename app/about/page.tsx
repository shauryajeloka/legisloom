export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">About LegisPal</h1>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            LegisPal is dedicated to making legislation more accessible and understandable through the power of
            artificial intelligence. We believe that everyone should have easy access to legislative information,
            regardless of their legal background.
          </p>
          <p className="text-gray-700">
            Our platform provides tools to search, analyze, and understand legislation from across state legislatures,
            helping citizens, advocates, researchers, and legal professionals navigate complex legal documents with
            ease.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <p className="text-gray-700 mb-4">
            LegisPal uses advanced natural language processing and machine learning algorithms to analyze legislative
            documents. Our AI can extract key information, summarize complex legal language, identify potential impacts,
            and provide insights that would typically require hours of manual review.
          </p>
          <p className="text-gray-700">
            For demonstration purposes, we currently use mock data from OpenStates API. In a production environment, we
            would integrate with official legislative databases to provide real-time, accurate information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <p className="text-gray-700 mb-4">
            LegisPal was created by a team of legal experts, data scientists, and software engineers who are passionate
            about making government more transparent and accessible. We combine expertise in legal analysis, artificial
            intelligence, and user experience design to create a platform that makes legislative information more
            accessible to everyone.
          </p>
          <p className="text-gray-700">
            This is a demonstration project showcasing the potential of AI in the legal and civic technology space.
          </p>
        </section>
      </div>
    </div>
  )
}
