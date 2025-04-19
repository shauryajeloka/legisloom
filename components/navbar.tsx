"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    { name: "Upload", path: "/upload" },
    { name: "About", path: "/about" },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  LP
                </div>
                <span className="ml-2 text-xl font-bold text-blue-600">LegisPal</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.path
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div>
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
