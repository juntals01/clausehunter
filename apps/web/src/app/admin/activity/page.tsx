"use client"

import { Activity, Clock, Upload, LogIn, UserPlus, FileText, Loader2 } from "lucide-react"
import { useUsers } from "@/lib/hooks/use-users"
import { useAdminContracts } from "@/lib/hooks/use-admin-contracts"
import { cn } from "@/lib/utils"

function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return "Never"
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const activityIcon: Record<string, typeof Activity> = {
  upload: Upload,
  login: LogIn,
  signup: UserPlus,
  contract: FileText,
}

export default function AdminActivityPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: contracts, isLoading: contractsLoading } = useAdminContracts()

  const isLoading = usersLoading || contractsLoading

  const activities = [
    ...(users?.map((u) => ({
      type: "signup" as const,
      label: `${u.name} joined`,
      detail: u.email,
      date: u.createdAt,
    })) ?? []),
    ...(contracts?.map((c: any) => ({
      type: "upload" as const,
      label: `Contract uploaded`,
      detail: c.originalFilename || c.vendor || "Unknown",
      date: c.createdAt,
    })) ?? []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E5E7EB]">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1E1B4B]">Activity</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Recent activity across the platform</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Activity className="h-10 w-10 text-[#D1D5DB] mb-3" />
            <p className="text-sm text-[#6B7280]">No activity yet</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="flex flex-col">
              {activities.map((item, i) => {
                const Icon = activityIcon[item.type] || Activity
                return (
                  <div key={i} className="flex items-start gap-4 py-4 border-b border-[#F3F4F6] last:border-0">
                    <div className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                      item.type === "signup" ? "bg-[#EEF2FF]" : "bg-[#F0FDF4]"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        item.type === "signup" ? "text-[#4F46E5]" : "text-[#16A34A]"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111827]">{item.label}</p>
                      <p className="text-xs text-[#6B7280] truncate">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(item.date)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
