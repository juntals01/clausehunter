"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
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
  Bell,
  Pencil,
  Check,
  X,
  Plus,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContract, useDeleteContract, useReprocessContract, useUpdateContract } from "@/lib/hooks/use-contracts"
import {
  useContractItems,
  useCreateContractItem,
  useUpdateContractItem,
  useDeleteContractItem,
  type ContractItem,
} from "@/lib/hooks/use-contract-items"
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@expirationreminderai/shared"
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

function computeItemDaysLeft(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const expiry = new Date(expiryDate)
  const now = new Date()
  return Math.ceil((expiry.getTime() - now.getTime()) / 86_400_000)
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
            Document not found
          </h2>
          <p className="text-sm text-[#78716C]">
            The document you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <a
            href="/dashboard/contracts"
            className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            Back to Documents
          </a>
        </div>
      </div>
    )
  }

  // ── Derived data ────────────────────────────────────────────────────
  const urgency = computeUrgency(contract.endDate, contract.noticeDays)
  const displayName = contract.title || contract.originalFilename?.replace(/\.[^/.]+$/, "") || contract.vendor || "Untitled"
  const isManualEntry = !contract.originalFilename
  const hasExtractionData = !!contract.extractionData
  const categoryLabel = DOCUMENT_CATEGORIES[(contract.category as DocumentCategory)] || "Document"

  const timeline: { label: string; date: string; icon: typeof UploadIcon }[] = [
    { label: isManualEntry ? "Added" : "Uploaded", date: formatDate(contract.createdAt), icon: isManualEntry ? FileText : UploadIcon },
  ]

  if (!isManualEntry) {
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
  }

  // ── Delete handler ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return
    await deleteContract.mutateAsync(contract.id)
    router.push("/dashboard/contracts")
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
          <NotificationDropdown />
          <div className="hidden sm:block"><UserDropdown /></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#78716C]">
          <a href="/dashboard/contracts" className="hover:text-[#1C1917] transition-colors">
            Documents
          </a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#1C1917] font-medium">{displayName}</span>
        </nav>

        {/* Title + Status + Category */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            {displayName}
          </h1>
          <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-600">
            {categoryLabel}
          </span>
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
                {contract.status === "queued" ? "Document queued for processing" : "Analyzing your document…"}
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

            {/* Items Section */}
            {contract.status === "ready" && (
              <ContractItemsSection contractId={contract.id} />
            )}

            {/* AI Extraction Sections (hidden for manual entries) */}
            {!isManualEntry && contract.extractionData?.summary && (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                  Summary
                </h2>
                <blockquote className="rounded-xl border-l-4 border-[#EA580C] bg-orange-50/50 p-4 text-sm text-[#1C1917] leading-relaxed">
                  {contract.extractionData.summary}
                </blockquote>
              </div>
            )}

            {!isManualEntry && contract.extractionData?.key_dates && contract.extractionData.key_dates.length > 0 && (
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

            {!isManualEntry && contract.extractionData?.renewal_clauses && contract.extractionData.renewal_clauses.length > 0 && (
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

            {!isManualEntry && contract.extractionData?.penalty_clauses && contract.extractionData.penalty_clauses.length > 0 && (
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

            {!isManualEntry && (contract.status === "processing" || contract.status === "queued") ? (
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
                {!isManualEntry && (
                  <>
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
                  </>
                )}
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
                  Delete Document
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
  const [title, setTitle] = useState(contract.title ?? "")
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
    setTitle(contract.title ?? "")
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
      title: title || undefined,
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
            Edit Document Details
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
            <label className="text-sm text-[#78716C]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office Lease Agreement"
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
          Document Details
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
        <DetailRow label="Title" value={contract.title ?? "—"} />
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

// ─── Contract Items Section ──────────────────────────────────────────

const ITEMS_PER_PAGE = 10

function ContractItemsSection({ contractId }: { contractId: string }) {
  const { data: items = [], isLoading } = useContractItems(contractId)
  const createItem = useCreateContractItem()
  const updateItem = useUpdateContractItem()
  const deleteItem = useDeleteContractItem()

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formExpiryDate, setFormExpiryDate] = useState("")
  const [formNoticeDays, setFormNoticeDays] = useState("")
  const [formStatus, setFormStatus] = useState("active")

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
  const pagedItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const resetForm = () => {
    setFormName("")
    setFormDescription("")
    setFormExpiryDate("")
    setFormNoticeDays("")
    setFormStatus("active")
  }

  const startEditing = (item: ContractItem) => {
    setEditingId(item.id)
    setFormName(item.name)
    setFormDescription(item.description ?? "")
    setFormExpiryDate(item.expiryDate ? item.expiryDate.slice(0, 10) : "")
    setFormNoticeDays(item.noticeDays != null ? String(item.noticeDays) : "")
    setFormStatus(item.status)
    setShowAdd(false)
  }

  const handleCreate = async () => {
    if (!formName.trim()) return
    try {
      await createItem.mutateAsync({
        contractId,
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        expiryDate: formExpiryDate || undefined,
        noticeDays: formNoticeDays ? Number(formNoticeDays) : undefined,
      })
      resetForm()
      setShowAdd(false)
    } catch {
      alert("Failed to add item. Please check the values and try again.")
    }
  }

  const handleUpdate = async () => {
    if (!editingId || !formName.trim()) return
    try {
      await updateItem.mutateAsync({
        contractId,
        itemId: editingId,
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        expiryDate: formExpiryDate || undefined,
        noticeDays: formNoticeDays ? Number(formNoticeDays) : undefined,
        status: formStatus,
      })
      setEditingId(null)
      resetForm()
    } catch {
      alert("Failed to update item. Please check the values and try again.")
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this item?")) return
    await deleteItem.mutateAsync({ contractId, itemId })
  }

  const getItemUrgency = (status: string, expiryDate: string | null): { label: string; color: string; bg: string; dot: string } => {
    if (status === "resolved") return { label: "Resolved", color: "text-stone-600", bg: "bg-stone-100", dot: "bg-stone-400" }

    const daysLeft = computeItemDaysLeft(expiryDate)
    if (daysLeft !== null && daysLeft <= 0) return { label: "Overdue", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" }
    if (status === "expired") return { label: "Expired", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" }
    if (daysLeft !== null && daysLeft <= 7) return { label: "Critical", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" }
    if (daysLeft !== null && daysLeft <= 30) return { label: "Expiring Soon", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" }
    if (daysLeft !== null && daysLeft <= 90) return { label: "Upcoming", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" }
    if (expiryDate) return { label: "On Track", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" }
    return { label: "No Date", color: "text-stone-500", bg: "bg-stone-50", dot: "bg-stone-300" }
  }

  const statusBadge = (status: string, expiryDate: string | null) => {
    const u = getItemUrgency(status, expiryDate)
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold", u.color, u.bg)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", u.dot)} />
        {u.label}
      </span>
    )
  }

  const overdue = items.filter((i) => i.status !== "resolved" && computeItemDaysLeft(i.expiryDate) !== null && computeItemDaysLeft(i.expiryDate)! <= 0).length
  const expiringSoon = items.filter((i) => { const d = computeItemDaysLeft(i.expiryDate); return i.status !== "resolved" && d !== null && d > 0 && d <= 30 }).length
  const onTrack = items.filter((i) => { const d = computeItemDaysLeft(i.expiryDate); return i.status !== "resolved" && d !== null && d > 30 }).length
  const noDate = items.filter((i) => i.expiryDate === null && i.status !== "resolved").length

  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-base font-semibold text-[#1C1917] flex items-center gap-2">
            <Package className="h-4 w-4 text-[#EA580C]" />
            Items
            {items.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                {items.length}
              </span>
            )}
          </h2>
          {items.some((i) => i.expiryDate) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#78716C]" title="Email alerts are sent when items are expiring">
              <Bell className="h-3 w-3" />
              Alerts On
            </span>
          )}
        </div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowAdd(true) }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E5E4] px-3 py-1.5 text-xs font-medium text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#EA580C] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Item
        </button>
      </div>

      {/* Status summary */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {overdue > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-red-700">{overdue} Overdue</span>
            </div>
          )}
          {expiringSoon > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{expiringSoon} Expiring Soon</span>
            </div>
          )}
          {onTrack > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-700">{onTrack} On Track</span>
            </div>
          )}
          {noDate > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-stone-50 border border-stone-200 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-stone-300" />
              <span className="text-xs font-semibold text-stone-500">{noDate} No Date</span>
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <ItemForm
          formName={formName}
          setFormName={setFormName}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          formExpiryDate={formExpiryDate}
          setFormExpiryDate={setFormExpiryDate}
          formNoticeDays={formNoticeDays}
          setFormNoticeDays={setFormNoticeDays}
          isPending={createItem.isPending}
          onSave={handleCreate}
          onCancel={() => { setShowAdd(false); resetForm() }}
          saveLabel="Add"
        />
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[#78716C] py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading items...
        </div>
      ) : items.length === 0 && !showAdd ? (
        <p className="text-sm text-[#78716C] py-2">
          No items extracted or added yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7E5E4]">
                  <th className="text-left text-[11px] font-medium text-[#78716C] uppercase tracking-wider pb-3 pr-4">Item</th>
                  <th className="text-left text-[11px] font-medium text-[#78716C] uppercase tracking-wider pb-3 px-4 whitespace-nowrap">Due Date</th>
                  <th className="text-left text-[11px] font-medium text-[#78716C] uppercase tracking-wider pb-3 px-4">Status</th>
                  <th className="text-left text-[11px] font-medium text-[#78716C] uppercase tracking-wider pb-3 px-4 whitespace-nowrap">Days Left</th>
                  <th className="pb-3 px-1 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]/50">
                {pagedItems.map((item) => {
                  if (editingId === item.id) {
                    return (
                      <tr key={item.id}>
                        <td colSpan={5} className="py-3">
                          <div className="rounded-xl border border-[#EA580C]/30 bg-orange-50/30 p-4">
                            <ItemForm
                              formName={formName}
                              setFormName={setFormName}
                              formDescription={formDescription}
                              setFormDescription={setFormDescription}
                              formExpiryDate={formExpiryDate}
                              setFormExpiryDate={setFormExpiryDate}
                              formNoticeDays={formNoticeDays}
                              setFormNoticeDays={setFormNoticeDays}
                              formStatus={formStatus}
                              setFormStatus={setFormStatus}
                              showStatus
                              isPending={updateItem.isPending}
                              onSave={handleUpdate}
                              onCancel={() => { setEditingId(null); resetForm() }}
                              saveLabel="Save"
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  }

                  const daysLeft = computeItemDaysLeft(item.expiryDate)

                  return (
                    <tr key={item.id} className="group hover:bg-[#FAFAF9] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                            <Package className="h-4 w-4 text-[#EA580C]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1C1917] truncate">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-[#A8A29E] truncate mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.expiryDate ? (
                          <span className="text-sm text-[#1C1917]">{formatDate(item.expiryDate)}</span>
                        ) : (
                          <span className="text-sm text-[#A8A29E]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {statusBadge(item.status, item.expiryDate)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {daysLeft !== null ? (
                          <span className={cn(
                            "text-sm font-medium",
                            daysLeft <= 0 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-green-600"
                          )}>
                            {daysLeft <= 0 ? "Overdue" : `${daysLeft}d`}
                          </span>
                        ) : (
                          <span className="text-sm text-[#A8A29E]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-1">
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(item)}
                            className="rounded-md p-1.5 text-[#78716C] hover:text-[#EA580C] hover:bg-orange-50 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteItem.isPending}
                            className="rounded-md p-1.5 text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E7E5E4]">
              <p className="text-xs text-[#78716C]">
                {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, items.length)} of {items.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-md p-1.5 text-[#78716C] hover:bg-[#FAFAF9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      "h-7 w-7 rounded-md text-xs font-medium transition-colors",
                      page === i
                        ? "bg-[#EA580C] text-white"
                        : "text-[#78716C] hover:bg-[#FAFAF9]"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-md p-1.5 text-[#78716C] hover:bg-[#FAFAF9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Item Form (shared between Add and Edit) ─────────────────────────

function ItemForm({
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  formExpiryDate,
  setFormExpiryDate,
  formNoticeDays,
  setFormNoticeDays,
  formStatus,
  setFormStatus,
  showStatus = false,
  isPending,
  onSave,
  onCancel,
  saveLabel,
}: {
  formName: string
  setFormName: (v: string) => void
  formDescription: string
  setFormDescription: (v: string) => void
  formExpiryDate: string
  setFormExpiryDate: (v: string) => void
  formNoticeDays: string
  setFormNoticeDays: (v: string) => void
  formStatus?: string
  setFormStatus?: (v: string) => void
  showStatus?: boolean
  isPending: boolean
  onSave: () => void
  onCancel: () => void
  saveLabel: string
}) {
  return (
    <div className="space-y-3 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#78716C]">Name *</label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Blood Pressure Monitor"
            className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#78716C]">Description</label>
          <input
            type="text"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Optional details"
            className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#78716C]">Expiry Date</label>
          <input
            type="date"
            value={formExpiryDate}
            onChange={(e) => setFormExpiryDate(e.target.value)}
            className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#78716C]">Notice (days)</label>
          <input
            type="number"
            min="0"
            value={formNoticeDays}
            onChange={(e) => setFormNoticeDays(e.target.value)}
            placeholder="e.g. 30"
            className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
      </div>
      {showStatus && setFormStatus && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#78716C]">Status:</label>
          {["active", "expired", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFormStatus(s)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition-colors border capitalize",
                formStatus === s
                  ? "border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]"
                  : "border-[#E7E5E4] bg-white text-[#78716C] hover:bg-[#FAFAF9]"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E5E4] px-3 py-1.5 text-xs font-medium text-[#78716C] hover:bg-[#FAFAF9] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isPending || !formName.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#DC4A04] transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
