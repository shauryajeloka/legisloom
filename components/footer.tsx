import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  LP
                </div>
                <span className="ml-2 text-xl font-bold text-blue-600">LegisPal</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Quick Links</h3>
              <div className="flex space-x-4">
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Home
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-blue-600">
                  About
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Connect</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  <Github className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
