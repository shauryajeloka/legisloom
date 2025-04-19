import Link from "next/link"

interface Bill {
  id: string
  identifier: string
  title: string
  jurisdiction: {
    name: string
  }
  session: string
  subjects?: string[]
}

interface BillResultItemProps {
  bill: Bill
}

export default function BillResultItem({ bill }: BillResultItemProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <Link href={`/bills/${bill.id}`} className="block">
        <h3 className="text-lg font-semibold">
          <span className="font-bold">{bill.identifier}</span> - {bill.title}
        </h3>
        <p className="text-gray-600 mt-1">
          {bill.jurisdiction.name} • {bill.session}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {bill.subjects?.map((subject) => (
            <span key={subject} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              {subject}
            </span>
          ))}
        </div>
      </Link>
    </div>
  )
}
