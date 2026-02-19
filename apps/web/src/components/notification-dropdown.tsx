"use client"

import { useRouter } from "next/navigation"
import { Bell, FileText, AlertCircle, CheckCheck, Clock, MessageSquare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/lib/hooks/use-notifications"

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const typeIcons: Record<string, typeof FileText> = {
  contract_ready: FileText,
  contract_failed: AlertCircle,
  deadline_approaching: Clock,
  deadline_urgent: AlertCircle,
  ticket_response: MessageSquare,
  welcome: Bell,
}

const typeColors: Record<string, string> = {
  contract_ready: "text-green-600 bg-green-50",
  contract_failed: "text-red-600 bg-red-50",
  deadline_approaching: "text-amber-600 bg-amber-50",
  deadline_urgent: "text-red-600 bg-red-50",
  ticket_response: "text-blue-600 bg-blue-50",
  welcome: "text-[#EA580C] bg-orange-50",
}

export function NotificationDropdown() {
  const router = useRouter()
  const { data } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-lg p-2 text-[#78716C] hover:bg-white hover:text-[#1C1917] transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA580C] text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7E5E4]">
          <span className="text-sm font-semibold text-[#1C1917]">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-1 text-xs text-[#EA580C] hover:text-[#DC4A04] transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-8 w-8 text-[#D6D3D1] mb-2" />
              <p className="text-sm text-[#78716C]">No notifications yet</p>
              <p className="text-xs text-[#A8A29E] mt-1">
                You&apos;ll be notified when your contracts are analyzed
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = typeIcons[notif.type] ?? Bell
              const colorClass = typeColors[notif.type] ?? "text-[#78716C] bg-[#F5F5F4]"

              return (
                <DropdownMenuItem
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer rounded-none ${
                    !notif.read ? "bg-orange-50/40" : ""
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead.mutate(notif.id)
                    if (notif.type === "ticket_response") {
                      router.push("/help")
                    } else if (notif.contractId) {
                      router.push(`/contracts/${notif.contractId}`)
                    }
                  }}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm leading-tight ${!notif.read ? "font-semibold text-[#1C1917]" : "font-medium text-[#44403C]"}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#EA580C]" />
                      )}
                    </div>
                    <p className="text-xs text-[#78716C] mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-[#A8A29E] mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
