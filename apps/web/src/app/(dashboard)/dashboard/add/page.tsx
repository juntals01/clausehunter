"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  FileText,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreateManualDocument } from "@/lib/hooks/use-contracts"
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@expirationreminderai/shared"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"

const categories = Object.entries(DOCUMENT_CATEGORIES) as [DocumentCategory, string][]

export default function AddDocumentPage() {
  const router = useRouter()
  const createMutation = useCreateManualDocument()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<DocumentCategory>("contract")
  const [vendor, setVendor] = useState("")
  const [endDate, setEndDate] = useState("")
  const [noticeDays, setNoticeDays] = useState("")
  const [autoRenews, setAutoRenews] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const doc = await createMutation.mutateAsync({
        title: title.trim(),
        category,
        vendor: vendor.trim() || undefined,
        endDate: endDate || undefined,
        noticeDays: noticeDays ? Number(noticeDays) : undefined,
        autoRenews,
      })
      router.push(`/dashboard/contracts/${doc.id}`)
    } catch {
      // Error is handled by mutation state
    }
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
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#1C1917]">
              Add Document
            </h1>
            <p className="mt-1 text-sm text-[#78716C]">
              Manually track a document, license, or any item with a due date
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6 sm:p-8 space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Business License - California"
                  required
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                >
                  {categories.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor / Provider */}
              <div>
                <label htmlFor="vendor" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Vendor / Provider
                </label>
                <input
                  id="vendor"
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. State of California"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Due / Expiration Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Notice Period */}
              <div>
                <label htmlFor="noticeDays" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Notice Period (days)
                </label>
                <input
                  id="noticeDays"
                  type="number"
                  min="0"
                  value={noticeDays}
                  onChange={(e) => setNoticeDays(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {/* Auto-Renews */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoRenews}
                  onClick={() => setAutoRenews(!autoRenews)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    autoRenews ? "bg-[#EA580C]" : "bg-[#D6D3D1]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                      autoRenews ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
                <label className="text-sm font-medium text-[#1C1917]">
                  Auto-renews
                </label>
              </div>
            </div>

            {/* Error */}
            {createMutation.isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">
                    {(createMutation.error as any)?.response?.data?.message ||
                      "Failed to create document. Please try again."}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-[#E7E5E4] bg-white px-5 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
