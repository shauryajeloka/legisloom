import type { ReactNode } from "react"

interface FeatureCardProps {
  title: string
  icon: ReactNode
  description: string
}

export default function FeatureCard({ title, icon, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
