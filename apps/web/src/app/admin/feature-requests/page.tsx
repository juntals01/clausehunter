"use client"

import { useState } from "react"
import { Lightbulb, Loader2, Search, ChevronUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useFeatureRequests,
  useUpdateFeatureRequest,
  useDeleteFeatureRequest,
  type FeatureRequestItem,
} from "@/lib/hooks/use-feature-requests"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-700" },
  { value: "planned", label: "Planned", color: "bg-purple-100 text-purple-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-500" },
]

export default function AdminFeatureRequestsPage() {
  const { data: requests = [], isLoading } = useFeatureRequests()
  const updateMutation = useUpdateFeatureRequest()
  const deleteMutation = useDeleteFeatureRequest()

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adminResponse, setAdminResponse] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filtered = requests
    .filter((r) => filterStatus === "all" || r.status === filterStatus)
    .filter(
      (r) =>
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.voteCount - a.voteCount)

  const selected = requests.find((r) => r.id === selectedId) || null

  const handleStatusChange = async (id: string, status: string) => {
    await updateMutation.mutateAsync({ id, status })
  }

  const handleAdminResponse = async () => {
    if (!selectedId || !adminResponse.trim()) return
    await updateMutation.mutateAsync({ id: selectedId, adminResponse: adminResponse.trim() })
    setAdminResponse("")
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    setDeleteConfirmId(null)
    if (selectedId === id) setSelectedId(null)
  }

  const openDetail = (request: FeatureRequestItem) => {
    setSelectedId(request.id)
    setAdminResponse(request.adminResponse || "")
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Feature Requests</h1>
          <p className="text-sm text-[#A5B4FC] mt-1">
            Manage and respond to user feature requests
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2E2968]">
          <Lightbulb className="w-5 h-5 text-[#818CF8]" />
          <span className="text-sm font-semibold text-white">{requests.length}</span>
          <span className="text-xs text-[#A5B4FC]">total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6366F1]" />
          <Input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#2E2968] border-[#3730A3] text-white placeholder:text-[#6366F1] focus-visible:ring-[#4F46E5]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#2E2968] border border-[#3730A3] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 flex flex-col gap-2">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#818CF8]" />
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lightbulb className="w-10 h-10 text-[#6366F1] mb-3" />
              <p className="text-sm text-[#A5B4FC]">No feature requests found</p>
            </div>
          )}

          {filtered.map((request) => (
            <button
              key={request.id}
              onClick={() => openDetail(request)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border text-left transition-colors w-full",
                selectedId === request.id
                  ? "bg-[#2E2968] border-[#4F46E5]"
                  : "bg-[#1E1B4B]/50 border-[#3730A3] hover:bg-[#2E2968]/60",
              )}
            >
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#2E2968] shrink-0">
                <ChevronUp className="w-3.5 h-3.5 text-[#818CF8]" />
                <span className="text-sm font-bold text-white">{request.voteCount}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{request.title}</h3>
                <p className="text-xs text-[#A5B4FC] truncate mt-0.5">
                  {request.user?.name || "Anonymous"} &middot;{" "}
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0",
                  STATUS_OPTIONS.find((s) => s.value === request.status)?.color ||
                    "bg-gray-100 text-gray-500",
                )}
              >
                {STATUS_OPTIONS.find((s) => s.value === request.status)?.label || request.status}
              </span>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-[420px] shrink-0 rounded-2xl border border-[#3730A3] bg-[#1E1B4B]/80 p-6 flex flex-col gap-5 h-fit sticky top-8">
            <div>
              <h2 className="font-display text-lg font-bold text-white mb-2">{selected.title}</h2>
              <p className="text-sm text-[#C7D2FE] leading-relaxed">{selected.description}</p>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#A5B4FC]">
              <span>By {selected.user?.name || "Anonymous"}</span>
              <span>&middot;</span>
              <span>{new Date(selected.createdAt).toLocaleDateString()}</span>
              <span>&middot;</span>
              <span className="font-semibold text-white">{selected.voteCount} votes</span>
            </div>

            {/* Status Selector */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-[#A5B4FC]">Status</Label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStatusChange(selected.id, s.value)}
                    disabled={updateMutation.isPending}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      selected.status === s.value
                        ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                        : "bg-[#2E2968] text-[#C7D2FE] border-[#3730A3] hover:border-[#4F46E5]",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Response */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-[#A5B4FC]">Admin Response</Label>
              <textarea
                rows={3}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Write a response visible to all users..."
                className="flex w-full rounded-lg border border-[#3730A3] bg-[#2E2968] px-3 py-2 text-sm text-white placeholder:text-[#6366F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] transition-colors resize-none"
              />
              <Button
                onClick={handleAdminResponse}
                disabled={updateMutation.isPending || !adminResponse.trim()}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs h-8 w-fit"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : null}
                Save Response
              </Button>
            </div>

            {/* Delete */}
            <div className="pt-3 border-t border-[#3730A3]">
              {deleteConfirmId === selected.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Delete this request?</span>
                  <Button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs h-7 px-3"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmId(null)}
                    variant="ghost"
                    className="text-[#A5B4FC] text-xs h-7 px-3"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(selected.id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Request
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
