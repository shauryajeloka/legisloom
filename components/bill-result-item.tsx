import Link from "next/link"

interface Bill {
  id: string
  identifier: string
  title: string
  jurisdiction: {
    name: string
    classification?: string
  }
  session: string
  subject?: string[]
  subjects?: string[]  // For backward compatibility
  classification?: string[]
  updated_at?: string
}

interface BillResultItemProps {
  bill: Bill
}

export default function BillResultItem({ bill }: BillResultItemProps) {
  // Use either subjects or subject, as the API might return either
  const subjectsList = bill.subjects || bill.subject || []
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <Link href={`/bills/${bill.id}`} className="block">
        <h3 className="text-lg font-semibold">
          <span className="font-bold">{bill.identifier}</span> - {bill.title}
        </h3>
        <p className="text-gray-600 mt-1">
          {bill.jurisdiction.name} • {bill.session}
          {bill.updated_at && ` • Updated: ${new Date(bill.updated_at).toLocaleDateString()}`}
        </p>
        {bill.classification && bill.classification.length > 0 && (
          <p className="text-gray-600">
            Type: {bill.classification.join(", ")}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {subjectsList.map((subject) => (
            <span key={subject} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              {subject}
            </span>
          ))}
          {subjectsList.length === 0 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full italic">
              No subjects
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}
