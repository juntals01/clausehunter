"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronRight,
  Download,
  Eye,
  RefreshCw,
  Trash2,
  Upload as UploadIcon,
  FileText,
  CalendarDays,
  Clock,
  Search,
  Upload,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Pencil,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContract, useDeleteContract, useReprocessContract, useUpdateContract } from "@/lib/hooks/use-contracts"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"
import api from "@/lib/api"

// ─── Helpers ──────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

type UrgencyStatus = "Urgent" | "Warning" | "Safe" | "Review"

function computeUrgency(
  endDate: string | null,
  noticeDays: number | null
): { status: UrgencyStatus; daysLeft: number | null; cancelBy: string | null } {
  if (!endDate) return { status: "Review", daysLeft: null, cancelBy: null }

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

// ─── Page ─────────────────────────────────────────────────────────────

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: contract, isLoading, error } = useContract(id)
  const deleteContract = useDeleteContract()
  const reprocessContract = useReprocessContract()
  const updateContract = useUpdateContract()

  // Poll while contract is being processed
  const isProcessing = contract?.status === "processing" || contract?.status === "queued"

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
          <NotificationDropdown />
          <div className="hidden sm:block"><UserDropdown /></div>
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
          {contract.status === "processing" || contract.status === "queued" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              {contract.status === "queued" ? "Queued" : "Processing"}
            </span>
          ) : contract.status === "failed" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3 w-3" />
              Failed
            </span>
          ) : (
            <StatusBadge status={urgency.status} />
          )}
        </div>

        {/* Processing banner */}
        {isProcessing && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {contract.status === "queued" ? "Contract queued for processing" : "Analyzing your contract…"}
              </p>
              <p className="text-xs text-blue-700">
                This may take a minute. The page will auto-update when ready.
              </p>
            </div>
          </div>
        )}

        {/* Failed banner */}
        {contract.status === "failed" && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Analysis failed</p>
              <p className="text-xs text-red-700">
                {contract.errorMessage || "An error occurred during processing. You can try re-analyzing."}
              </p>
            </div>
            <button
              onClick={() => reprocessContract.mutateAsync(contract.id)}
              disabled={reprocessContract.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {reprocessContract.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Retry
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            {/* Contract Details (editable) */}
            <ContractDetailsCard
              contract={contract}
              urgency={urgency}
              onUpdate={updateContract}
            />

            {/* Summary */}
            {contract.extractionData?.summary && (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Summary
                </h2>
                <blockquote className="rounded-xl border-l-4 border-[#EA580C] bg-orange-50/50 p-4 text-sm text-[#1C1917] leading-relaxed">
                  {contract.extractionData.summary}
                </blockquote>
              </div>
            )}

            {/* Key Dates */}
            {contract.extractionData?.key_dates && contract.extractionData.key_dates.length > 0 && (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Key Dates
                </h2>
                <div className="space-y-3">
                  {contract.extractionData.key_dates.map((kd, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-[#FAFAF9] p-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                        <CalendarDays className="h-4 w-4 text-[#EA580C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1C1917]">{kd.label}</span>
                          <span className="text-xs text-[#78716C]">{formatDate(kd.date)}</span>
                        </div>
                        <p className="text-xs text-[#78716C] mt-1 line-clamp-2">{kd.source_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Renewal Clauses */}
            {contract.extractionData?.renewal_clauses && contract.extractionData.renewal_clauses.length > 0 && (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Renewal Clauses
                </h2>
                <div className="space-y-3">
                  {contract.extractionData.renewal_clauses.map((cl, i) => (
                    <div key={i} className="rounded-xl border-l-4 border-amber-400 bg-amber-50/50 p-4">
                      <p className="text-sm font-medium text-[#1C1917]">{cl.clause_text}</p>
                      <p className="text-xs text-[#78716C] mt-2 italic">&ldquo;{cl.source_text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Penalty Clauses */}
            {contract.extractionData?.penalty_clauses && contract.extractionData.penalty_clauses.length > 0 && (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Penalty Clauses
                </h2>
                <div className="space-y-3">
                  {contract.extractionData.penalty_clauses.map((cl, i) => (
                    <div key={i} className="rounded-xl border-l-4 border-red-400 bg-red-50/50 p-4">
                      <p className="text-sm font-medium text-[#1C1917]">{cl.clause_text}</p>
                      <p className="text-xs text-[#78716C] mt-2 italic">&ldquo;{cl.source_text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing / Failed states */}
            {contract.status === "processing" || contract.status === "queued" ? (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Extraction
                </h2>
                <div className="flex items-center gap-2 text-sm text-[#78716C]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysis in progress…
                </div>
              </div>
            ) : contract.status === "failed" ? (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Extraction
                </h2>
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {contract.errorMessage ?? "Analysis failed."}
                </div>
              </div>
            ) : contract.status === "ready" && !contract.extractionData ? (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Extraction
                </h2>
                <p className="text-sm text-[#78716C]">No detailed extraction data available. Try re-analyzing.</p>
              </div>
            ) : null}
          </div>

          {/* Right column */}
          <div className="w-full lg:w-[320px] space-y-6">
            {/* Quick Actions */}
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const { data } = await api.get(`/contracts/${contract.id}/file`)
                      window.open(data.url, "_blank")
                    } catch {
                      alert("Could not load file")
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
                >
                  <Eye className="h-4 w-4 text-[#78716C]" />
                  View File
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { data } = await api.get(`/contracts/${contract.id}/file`)
                      const link = document.createElement("a")
                      link.href = data.url
                      link.download = data.filename
                      link.click()
                    } catch {
                      alert("Could not download file")
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
                >
                  <Download className="h-4 w-4 text-[#78716C]" />
                  Download Original
                </button>
                <button
                  onClick={async () => {
                    try {
                      await reprocessContract.mutateAsync(contract.id)
                    } catch (e) {
                      alert("Failed to reprocess: " + (e as Error).message)
                    }
                  }}
                  disabled={reprocessContract.isPending || isProcessing}
                  className="flex w-full items-center gap-3 rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors disabled:opacity-50"
                >
                  {reprocessContract.isPending || isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#78716C]" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-[#78716C]" />
                  )}
                  {isProcessing ? "Processing…" : "Re-analyze"}
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

// ─── Editable Contract Details Card ──────────────────────────────────

function ContractDetailsCard({
  contract,
  urgency,
  onUpdate,
}: {
  contract: NonNullable<ReturnType<typeof useContract>["data"]>
  urgency: ReturnType<typeof computeUrgency>
  onUpdate: ReturnType<typeof useUpdateContract>
}) {
  const [editing, setEditing] = useState(false)
  const [vendor, setVendor] = useState(contract.vendor ?? "")
  const [endDate, setEndDate] = useState(
    contract.endDate ? contract.endDate.slice(0, 10) : ""
  )
  const [noticeDays, setNoticeDays] = useState(
    contract.noticeDays != null ? String(contract.noticeDays) : ""
  )
  const [autoRenews, setAutoRenews] = useState<boolean | null>(
    contract.autoRenews ?? null
  )

  const startEditing = () => {
    setVendor(contract.vendor ?? "")
    setEndDate(contract.endDate ? contract.endDate.slice(0, 10) : "")
    setNoticeDays(contract.noticeDays != null ? String(contract.noticeDays) : "")
    setAutoRenews(contract.autoRenews ?? null)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
  }

  const save = async () => {
    await onUpdate.mutateAsync({
      id: contract.id,
      vendor: vendor || undefined,
      endDate: endDate || undefined,
      noticeDays: noticeDays ? Number(noticeDays) : undefined,
      autoRenews: autoRenews ?? undefined,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-[#EA580C]/30 bg-white p-6 ring-1 ring-[#EA580C]/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-[#1C1917]">
            Edit Contract Details
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEditing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E5E4] px-3 py-1.5 text-xs font-medium text-[#78716C] hover:bg-[#FAFAF9] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              onClick={save}
              disabled={onUpdate.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#DC4A04] transition-colors disabled:opacity-50"
            >
              {onUpdate.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Save
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#78716C]">Vendor</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#78716C]">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#78716C]">Notice Period (days)</label>
            <input
              type="number"
              min="0"
              value={noticeDays}
              onChange={(e) => setNoticeDays(e.target.value)}
              placeholder="e.g. 30"
              className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <label className="text-sm text-[#78716C]">Auto-renews</label>
            <div className="flex items-center gap-2">
              {[
                { label: "Yes", val: true },
                { label: "No", val: false },
                { label: "Unknown", val: null },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAutoRenews(opt.val)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                    autoRenews === opt.val
                      ? "border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]"
                      : "border-[#E7E5E4] bg-white text-[#78716C] hover:bg-[#FAFAF9]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-semibold text-[#1C1917]">
          Contract Details
        </h2>
        <button
          onClick={startEditing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E5E4] px-3 py-1.5 text-xs font-medium text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#EA580C] transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="space-y-4">
        <DetailRow label="Vendor" value={contract.vendor ?? "—"} />
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
        <DetailRow label="Cancel By" value={urgency.cancelBy ?? "—"} />
        <DetailRow
          label="Status"
          value={
            urgency.status === "Review" ? (
              <span className="inline-flex items-center gap-1 font-medium text-yellow-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Needs review — add missing dates
              </span>
            ) : urgency.daysLeft != null ? (
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
  )
}

// ─── Detail Row ──────────────────────────────────────────────────────

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
