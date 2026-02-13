"use client"

import { useParams, useRouter } from "next/navigation"
import {
  ChevronRight,
  Download,
  RefreshCw,
  Trash2,
  Upload as UploadIcon,
  FileText,
  CalendarDays,
  Clock,
  Bell,
  Search,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContract, useDeleteContract } from "@/lib/hooks/use-contracts"
import { useAuth } from "@/lib/auth-context"

// ─── Helpers ──────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getInitials(name: string | undefined) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

type UrgencyStatus = "Urgent" | "Warning" | "Safe"

function computeUrgency(
  endDate: string | null,
  noticeDays: number | null
): { status: UrgencyStatus; daysLeft: number | null; cancelBy: string | null } {
  if (!endDate) return { status: "Safe", daysLeft: null, cancelBy: null }

  const end = new Date(endDate)
  const now = new Date()
  const msPerDay = 86_400_000

  const notice = noticeDays ?? 0
  const cancelByDate = new Date(end.getTime() - notice * msPerDay)
  const daysLeft = Math.ceil((cancelByDate.getTime() - now.getTime()) / msPerDay)

  let status: UrgencyStatus = "Safe"
  if (daysLeft <= 0) status = "Urgent"
  else if (daysLeft <= 30) status = "Warning"

  return {
    status,
    daysLeft,
    cancelBy: formatDate(cancelByDate.toISOString()),
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UrgencyStatus }) {
  const styles: Record<UrgencyStatus, string> = {
    Urgent: "bg-red-50 text-red-600",
    Warning: "bg-amber-50 text-amber-600",
    Safe: "bg-green-50 text-green-600",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {status}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { data: contract, isLoading, error } = useContract(id)
  const deleteContract = useDeleteContract()

  // ── Loading state ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#EA580C]" />
        </div>
      </div>
    )
  }

  // ── Error / not-found state ─────────────────────────────────────────
  if (error || !contract) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="font-display text-xl font-semibold text-[#1C1917]">
            Contract not found
          </h2>
          <p className="text-sm text-[#78716C]">
            The contract you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <a
            href="/contracts"
            className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            Back to Contracts
          </a>
        </div>
      </div>
    )
  }

  // ── Derived data ────────────────────────────────────────────────────
  const urgency = computeUrgency(contract.endDate, contract.noticeDays)
  const displayName = contract.originalFilename.replace(/\.[^/.]+$/, "")

  const timeline: { label: string; date: string; icon: typeof UploadIcon }[] = [
    { label: "Uploaded", date: formatDate(contract.createdAt), icon: UploadIcon },
  ]

  if (contract.status === "ready") {
    timeline.push({
      label: "Analysis complete",
      date: formatDate(contract.updatedAt),
      icon: FileText,
    })
  } else if (contract.status === "processing") {
    timeline.push({
      label: "Processing",
      date: formatDate(contract.updatedAt),
      icon: Clock,
    })
  } else if (contract.status === "failed") {
    timeline.push({
      label: "Failed",
      date: formatDate(contract.updatedAt),
      icon: AlertCircle,
    })
  }

  // ── Delete handler ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contract?")) return
    await deleteContract.mutateAsync(contract.id)
    router.push("/contracts")
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
          <button className="relative rounded-lg p-2 text-[#78716C] hover:bg-white hover:text-[#1C1917] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EA580C]" />
          </button>
          <div className="hidden sm:flex h-8 w-8 rounded-full bg-[#EA580C] text-white items-center justify-center text-sm font-medium">
            {getInitials(user?.name)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#78716C]">
          <a href="/contracts" className="hover:text-[#1C1917] transition-colors">
            Contracts
          </a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#1C1917] font-medium">{displayName}</span>
        </nav>

        {/* Title + Status */}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            {displayName}
          </h1>
          <StatusBadge status={urgency.status} />
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            {/* Contract Details */}
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                Contract Details
              </h2>
              <div className="space-y-4">
                <DetailRow
                  label="Vendor"
                  value={contract.vendor ?? "—"}
                />
                <DetailRow
                  label="End Date"
                  value={contract.endDate ? formatDate(contract.endDate) : "—"}
                />
                <DetailRow
                  label="Notice Period"
                  value={
                    contract.noticeDays != null
                      ? `${contract.noticeDays} days`
                      : "—"
                  }
                />
                <DetailRow
                  label="Cancel By"
                  value={urgency.cancelBy ?? "—"}
                />
                <DetailRow
                  label="Status"
                  value={
                    urgency.daysLeft != null ? (
                      <span
                        className={cn(
                          "font-medium",
                          urgency.status === "Urgent" && "text-red-600",
                          urgency.status === "Warning" && "text-amber-600",
                          urgency.status === "Safe" && "text-green-600"
                        )}
                      >
                        {urgency.daysLeft <= 0
                          ? "Past notice window"
                          : `${urgency.daysLeft} days left`}
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow
                  label="Auto-renews"
                  value={
                    contract.autoRenews != null
                      ? contract.autoRenews
                        ? "Yes"
                        : "No"
                      : "—"
                  }
                />
              </div>
            </div>

            {/* Extracted Clause (placeholder for clause data) */}
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                Extracted Clause
              </h2>
              {contract.status === "ready" ? (
                <blockquote className="rounded-xl border-l-4 border-[#EA580C] bg-orange-50/50 p-4 text-sm italic text-[#1C1917] leading-relaxed">
                  Clause data will appear here once extraction is available.
                </blockquote>
              ) : contract.status === "processing" ? (
                <div className="flex items-center gap-2 text-sm text-[#78716C]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysis in progress…
                </div>
              ) : contract.status === "failed" ? (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {contract.errorMessage ?? "Analysis failed."}
                </div>
              ) : (
                <p className="text-sm text-[#78716C]">No clause data available.</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="w-full lg:w-[320px] space-y-6">
            {/* Quick Actions */}
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="flex w-full items-center gap-3 rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors">
                  <Download className="h-4 w-4 text-[#78716C]" />
                  Download Original
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors">
                  <RefreshCw className="h-4 w-4 text-[#78716C]" />
                  Re-analyze
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteContract.isPending}
                  className="flex w-full items-center gap-3 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleteContract.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete Contract
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                Timeline
              </h2>
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                      <item.icon className="h-4 w-4 text-[#EA580C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">{item.label}</p>
                      <p className="text-xs text-[#78716C]">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#E7E5E4] last:border-0">
      <span className="text-sm text-[#78716C]">{label}</span>
      <span className="text-sm font-medium text-[#1C1917]">{value}</span>
    </div>
  )
}
