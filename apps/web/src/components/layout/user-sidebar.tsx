"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileSearch, LayoutDashboard, Upload, FileText, Settings, CreditCard, LifeBuoy } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/contracts", icon: FileText, label: "Contracts" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/help", icon: LifeBuoy, label: "Help" },
]

export function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col justify-between w-60 h-full bg-white border-r border-[#FFF1E6] py-6 px-5 shrink-0">
      <div className="flex flex-col gap-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
          <div className="flex items-center justify-center w-8 h-8 bg-[#EA580C] rounded-[10px]">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-[#0D0D0D]">Clause Hunter</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-[#FFF7ED] text-[#EA580C] font-medium"
                    : "text-[#7A7A7A] hover:bg-[#FFF7ED]/50 hover:text-[#EA580C]"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[#EA580C]" : "text-[#7A7A7A]")} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2.5 px-2 pt-3 border-t border-[#E7E5E4]">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-600">
          <span className="text-xs font-medium text-white font-display">JD</span>
        </div>
        <span className="text-[13px] font-medium text-[#0D0D0D]">John Doe</span>
      </div>
    </aside>
  )
}
