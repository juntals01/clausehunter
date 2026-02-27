"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FileSearch, LayoutDashboard, Upload, Plus, FileText, Settings, CreditCard, LifeBuoy, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload Document" },
  { href: "/dashboard/add", icon: Plus, label: "Add Reminder" },
  { href: "/dashboard/contracts", icon: FileText, label: "Documents" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/help", icon: LifeBuoy, label: "Help" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col justify-between w-60 h-full bg-white border-r border-[#FFF1E6] py-6 px-5 shrink-0">
      <div className="flex flex-col gap-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
          <div className="flex items-center justify-center w-8 h-8 bg-[#EA580C] rounded-[10px]">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-[#0D0D0D]">Expiration Reminder AI</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/")
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
      {user && (
        <div className="flex items-center gap-2.5 px-2 pt-3 border-t border-[#E7E5E4]">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-orange-400 to-orange-600">
              <span className="text-xs font-medium text-white font-display">
                {getInitials(user.name)}
              </span>
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[13px] font-medium text-[#0D0D0D] truncate">{user.name}</span>
            <span className="text-[11px] text-[#7A7A7A] truncate">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-[#A8A29E] hover:text-[#EA580C] hover:bg-[#FFF7ED] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
