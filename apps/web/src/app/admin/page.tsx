"use client"

import {
  Search,
  Download,
  UserPlus,
  TrendingUp,
  Users,
  Activity,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUsers, useUserCount } from "@/lib/hooks/use-users"
import { useAdminContracts } from "@/lib/hooks/use-admin-contracts"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

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

export default function AdminOverviewPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: userCount } = useUserCount()
  const { data: contracts, isLoading: contractsLoading } = useAdminContracts()

  const isLoading = usersLoading || contractsLoading
  const totalUsers = userCount ?? users?.length ?? 0
  const totalContracts = contracts?.length ?? 0
  const activeToday = users?.filter(
    (u) =>
      u.lastActiveAt &&
      Date.now() - new Date(u.lastActiveAt).getTime() < 24 * 60 * 60 * 1000
  ).length ?? 0

  const metrics = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+12%",
      changeColor: "text-emerald-400",
      changeBg: "bg-emerald-400/10",
      icon: Users,
    },
    {
      label: "Active Today",
      value: activeToday.toLocaleString(),
      change: "+4%",
      changeColor: "text-emerald-400",
      changeBg: "bg-emerald-400/10",
      icon: Activity,
    },
    {
      label: "New This Month",
      value: (
        users?.filter((u) => {
          const created = new Date(u.createdAt)
          const now = new Date()
          return (
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear()
          )
        }).length ?? 0
      ).toLocaleString(),
      change: "+25%",
      changeColor: "text-amber-400",
      changeBg: "bg-amber-400/10",
      icon: TrendingUp,
    },
    {
      label: "Documents",
      value: totalContracts.toLocaleString(),
      change: "+8%",
      changeColor: "text-emerald-400",
      changeBg: "bg-emerald-400/10",
      icon: FileText,
    },
  ]

  // Most recently active users as "activity"
  const recentUsers = [...(users ?? [])]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5)

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#EBEBEB] bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-400">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-medium text-gray-900">Overview</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-9 w-64 h-9 rounded-lg border-[#EBEBEB] bg-[#F8F9FC] text-sm focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 border-[#EBEBEB]">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <a href="/admin/users">
            <Button variant="admin" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor your platform&apos;s key metrics and recent activity.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metric.label}
                    className="bg-[#1E1B4B] rounded-[14px] p-5 text-white flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[#A5B4FC]" />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          metric.changeBg,
                          metric.changeColor
                        )}
                      >
                        {metric.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-display">
                        {metric.value}
                      </p>
                      <p className="text-sm text-[#A5B4FC] mt-0.5">
                        {metric.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
                <h2 className="text-lg font-semibold font-display text-gray-900">
                  Recent User Activity
                </h2>
                <a
                  href="/admin/users"
                  className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1E1B4B]">
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {recentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(user.lastActiveAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
