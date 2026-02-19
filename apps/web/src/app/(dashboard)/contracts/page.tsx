"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Upload,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContracts, type DashboardContract } from "@/lib/hooks/use-contracts"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"

type StatusLabel = "Urgent" | "Warning" | "Safe" | "Review"

const urgencyToLabel: Record<DashboardContract["urgencyStatus"], StatusLabel> = {
  "in-window": "Urgent",
  approaching: "Warning",
  safe: "Safe",
  "needs-review": "Review",
}

const statusBadge = (status: StatusLabel) => {
  const styles: Record<StatusLabel, string> = {
    Urgent: "bg-red-50 text-red-600",
    Warning: "bg-amber-50 text-amber-600",
    Safe: "bg-green-50 text-green-600",
    Review: "bg-yellow-50 text-yellow-600",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {status === "Review" && <AlertTriangle className="h-3 w-3" />}
      {status}
    </span>
  )
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function computeCancelByDate(endDate: string | null, noticeDays: number | null): string {
  if (!endDate || noticeDays === null) return "—"
  const d = new Date(endDate)
  d.setDate(d.getDate() - noticeDays)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color =
    value >= 95 ? "#16a34a" : value >= 85 ? "#EA580C" : "#78716C"

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" className="-rotate-90">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm font-medium text-[#1C1917]">{value}%</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-full animate-pulse">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#E7E5E4]">
        <div className="h-9 w-full sm:w-80 rounded-lg bg-[#E7E5E4]" />
        <div className="hidden sm:flex items-center gap-4">
          <div className="h-9 w-36 rounded-lg bg-[#E7E5E4]" />
          <div className="h-9 w-9 rounded-lg bg-[#E7E5E4]" />
          <div className="h-8 w-8 rounded-full bg-[#E7E5E4]" />
        </div>
      </div>
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 rounded bg-[#E7E5E4]" />
          <div className="h-5 w-24 rounded bg-[#E7E5E4]" />
        </div>
        <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 w-full rounded bg-[#E7E5E4]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContractsPage() {
  const { data: contracts, isLoading, error } = useContracts()
  const router = useRouter()

  const sortedContracts = useMemo(() => {
    if (!contracts) return []
    return [...contracts].sort((a, b) => {
      if (a.daysLeftToCancel === null) return 1
      if (b.daysLeftToCancel === null) return -1
      return a.daysLeftToCancel - b.daysLeftToCancel
    })
  }, [contracts])

  if (isLoading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-sm text-[#78716C]">Failed to load contracts. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#E7E5E4]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search contracts..."
            className="w-full rounded-lg border border-[#E7E5E4] bg-white py-2 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex items-center gap-4 ml-4">
          <a
            href="/upload"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload contract
          </a>
          <a
            href="/upload"
            className="sm:hidden inline-flex items-center justify-center rounded-lg bg-[#EA580C] p-2 text-white hover:bg-[#DC4A04] transition-colors"
          >
            <Upload className="h-4 w-4" />
          </a>
          <NotificationDropdown />
          <div className="hidden sm:block"><UserDropdown /></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">Contracts</h1>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#EA580C]">
            All {sortedContracts.length} contracts <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Cancel By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Days Left
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {sortedContracts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#78716C]">
                      No contracts yet. Upload your first contract to get started.
                    </td>
                  </tr>
                ) : (
                  sortedContracts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/contracts/${c.id}`)}
                      className="hover:bg-[#FAFAF9] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[#1C1917]">
                        {c.vendor ?? "Unknown Vendor"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#78716C]">
                        {formatDate(c.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(urgencyToLabel[c.urgencyStatus])}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#78716C]">
                        {computeCancelByDate(c.endDate, c.noticeDays)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#1C1917]">
                        {c.daysLeftToCancel ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
