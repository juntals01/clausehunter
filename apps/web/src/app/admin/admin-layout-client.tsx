"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { UserDropdown } from "@/components/user-dropdown"

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white admin-layout">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-[260px] h-full">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-[#F8F9FC] overflow-auto flex flex-col">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1E1B4B] border-b border-[#3730A3]">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-[#A5B4FC] hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/admin" className="font-display text-sm font-semibold text-white">Admin Panel</Link>
          <UserDropdown variant="admin" />
        </div>
        {children}
      </main>
    </div>
  )
}
