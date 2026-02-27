"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Upload,
  Plus,
  FileText,
  ArrowRight,
  AlertTriangle,
  Clock,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContracts, type DashboardContract } from "@/lib/hooks/use-contracts"
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@expirationreminderai/shared"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"

const filters = ["All", "Safe", "Warning", "Urgent", "Review"] as const
type Filter = (typeof filters)[number]

const urgencyToLabel: Record<DashboardContract["urgencyStatus"], string> = {
  "in-window": "Urgent",
  approaching: "Warning",
  safe: "Safe",
  "needs-review": "Review",
}

const urgencyToFilter: Record<DashboardContract["urgencyStatus"], Filter> = {
  "in-window": "Urgent",
  approaching: "Warning",
  safe: "Safe",
  "needs-review": "Review",
}

type StatusLabel = "Urgent" | "Warning" | "Safe" | "Review"

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

const categoryBadge = (category: DocumentCategory) => {
  const styles: Record<DocumentCategory, string> = {
    contract: "bg-blue-50 text-blue-700",
    license: "bg-purple-50 text-purple-700",
    insurance: "bg-teal-50 text-teal-700",
    certification: "bg-indigo-50 text-indigo-700",
    permit: "bg-cyan-50 text-cyan-700",
    subscription: "bg-pink-50 text-pink-700",
    lease: "bg-emerald-50 text-emerald-700",
    registration: "bg-violet-50 text-violet-700",
    other: "bg-stone-100 text-stone-600",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        styles[category] || styles.other
      )}
    >
      {DOCUMENT_CATEGORIES[category] || "Other"}
    </span>
  )
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function computeCancelByDate(endDate: string | null, noticeDays: number | null): string {
  if (!endDate || noticeDays === null) return "—"
  const d = new Date(endDate)
  d.setDate(d.getDate() - noticeDays)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function AddDocumentDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Document
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <a
        href="/dashboard/upload"
        className="sm:hidden inline-flex items-center justify-center rounded-lg bg-[#EA580C] p-2 text-white hover:bg-[#DC4A04] transition-colors"
      >
        <Plus className="h-4 w-4" />
      </a>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[#E7E5E4] bg-white py-1 shadow-lg z-50">
          <a
            href="/dashboard/upload"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
          >
            <Upload className="h-4 w-4 text-[#78716C]" />
            Upload File
          </a>
          <a
            href="/dashboard/add"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
          >
            <FileText className="h-4 w-4 text-[#78716C]" />
            Add Manually
          </a>
        </div>
      )}
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
        <div>
          <div className="h-7 w-40 rounded bg-[#E7E5E4]" />
          <div className="mt-2 h-4 w-72 rounded bg-[#E7E5E4]" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <div className="h-4 w-24 rounded bg-[#E7E5E4]" />
              <div className="mt-4 h-8 w-16 rounded bg-[#E7E5E4]" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full rounded bg-[#E7E5E4]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All")
  const { data: contracts, isLoading, error } = useContracts()
  const router = useRouter()

  const metrics = useMemo(() => {
    if (!contracts) return null

    const totalDocuments = contracts.length
    const trackedDeadlines = contracts.filter(
      (c) => c.status === "ready" && c.endDate !== null
    ).length
    const urgentCount = contracts.filter(
      (c) => c.daysLeftToCancel !== null && c.daysLeftToCancel <= 30
    ).length

    const docsWithEndDate = contracts
      .filter((c) => c.endDate !== null)
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
    const nextExpiry =
      docsWithEndDate.length > 0
        ? formatShortDate(docsWithEndDate[0].endDate)
        : "—"

    return [
      { label: "Total Documents", value: String(totalDocuments), icon: FileText, color: "text-[#1C1917]" },
      { label: "Tracked Deadlines", value: String(trackedDeadlines), icon: CalendarDays, color: "text-[#1C1917]" },
      {
        label: "Urgent (in 30 days)",
        value: String(urgentCount),
        icon: AlertTriangle,
        color: "text-red-600",
        accent: true,
      },
      { label: "Next Expiry", value: nextExpiry, icon: Clock, color: "text-[#1C1917]" },
    ]
  }, [contracts])

  const filteredContracts = useMemo(() => {
    if (!contracts) return []

    const sorted = [...contracts]
      .filter((c) => c.daysLeftToCancel !== null || c.urgencyStatus === "needs-review")
      .sort((a, b) => {
        if (a.daysLeftToCancel === null) return 1
        if (b.daysLeftToCancel === null) return -1
        return a.daysLeftToCancel - b.daysLeftToCancel
      })

    if (activeFilter === "All") return sorted
    return sorted.filter((c) => urgencyToFilter[c.urgencyStatus] === activeFilter)
  }, [contracts, activeFilter])

  const recentDocuments = useMemo(() => {
    if (!contracts) return []
    return [...contracts]
      .filter((c) => c.status === "ready")
      .slice(0, 3)
  }, [contracts])

  if (isLoading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-sm text-[#78716C]">Failed to load dashboard data. Please try again.</p>
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
            placeholder="Search documents..."
            className="w-full rounded-lg border border-[#E7E5E4] bg-white py-2 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex items-center gap-4 ml-4">
          <AddDocumentDropdown />
          <NotificationDropdown />
          <div className="hidden sm:block"><UserDropdown /></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Overview of your document deadlines and renewals
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics?.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-[#E7E5E4] bg-white p-4 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#78716C]">{m.label}</span>
                <m.icon className="h-5 w-5 text-[#78716C]" />
              </div>
              <p
                className={cn(
                  "mt-2 text-3xl font-bold font-display",
                  m.accent ? "text-red-600" : "text-[#1C1917]"
                )}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeFilter === f
                  ? "bg-[#EA580C] text-white"
                  : "bg-white text-[#78716C] border border-[#E7E5E4] hover:text-[#1C1917]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-[#1C1917]">
              Upcoming Deadlines
            </h2>
            <a
              href="/dashboard/contracts"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#EA580C] hover:underline"
            >
              View All <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                      Days Left
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#78716C]">
                        No documents match this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => router.push(`/dashboard/contracts/${row.id}`)}
                        className="hover:bg-[#FAFAF9] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#1C1917]">
                          {row.title || row.vendor || "Untitled"}
                        </td>
                        <td className="px-6 py-4">
                          {categoryBadge(row.category)}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#78716C]">
                          {formatDate(row.endDate)}
                        </td>
                        <td className="px-6 py-4">
                          {statusBadge(urgencyToLabel[row.urgencyStatus] as StatusLabel)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#1C1917]">
                          {row.daysLeftToCancel ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recently Added */}
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1C1917] mb-4">
            Recently Added
          </h2>
          <div className="space-y-3">
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-[#78716C]">No documents yet.</p>
            ) : (
              recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/dashboard/contracts/${doc.id}`)}
                  className="flex items-center justify-between rounded-2xl border border-[#E7E5E4] bg-white px-6 py-4 cursor-pointer hover:bg-[#FAFAF9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                      <FileText className="h-5 w-5 text-[#EA580C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">
                        {doc.title || doc.vendor || "Untitled"}
                      </p>
                      <p className="text-xs text-[#78716C]">
                        {DOCUMENT_CATEGORIES[doc.category] || "Document"} &middot; {formatDate(doc.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                      <ShieldCheck className="h-3 w-3" />
                      Tracked
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#78716C]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
