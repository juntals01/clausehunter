"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { UserSidebar } from "@/components/layout/user-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <UserSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 h-full">
            <UserSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-[#FFFBF5] overflow-auto flex flex-col">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E7E5E4]">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-[#78716C] hover:text-[#1C1917]">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="font-display text-sm font-semibold text-[#1C1917]">Clause Hunter</Link>
          <div className="w-8" />
        </div>
        {children}
      </main>
    </div>
  )
}
