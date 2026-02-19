"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FileSearch, LayoutDashboard, Users, FileText, MessageSquare, Activity, Settings, LogOut, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/contracts", icon: FileText, label: "Contracts" },
  { href: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
  { href: "/admin/email", icon: Mail, label: "Email" },
  { href: "/admin/activity", icon: Activity, label: "Activity" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col justify-between w-[260px] h-full bg-[#1E1B4B] py-7 px-5 shrink-0">
      <div className="flex flex-col gap-8">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <div className="flex items-center justify-center w-8 h-8 bg-[#4F46E5] rounded-[10px]">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[18px] font-bold text-white leading-tight">Expiration Reminder AI</span>
            <span className="text-[9px] font-bold text-[#818CF8] tracking-[2px]">ADMIN PANEL</span>
          </div>
        </Link>
        <nav className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-[#6366F1] tracking-[1.5px] px-3.5 mb-2">MENU</span>
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-[11px] rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-[#2E2968] text-[#E0E7FF] font-semibold"
                    : "text-[#A5B4FC] hover:bg-[#2E2968]/50"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[#A5B4FC]" : "text-[#6366F1]")} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      {user && (
        <div className="flex items-center gap-2.5 px-1 pt-3 border-t border-[#3730A3]">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4F46E5]">
              <span className="text-xs font-medium text-white">
                {getInitials(user.name)}
              </span>
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[13px] font-medium text-white truncate">{user.name}</span>
            <span className="text-[11px] text-[#818CF8] truncate">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-[#6366F1] hover:text-white hover:bg-[#2E2968] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
