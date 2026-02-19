"use client"

import { useState } from "react"
import {
  Search,
  ChevronRight,
  Loader2,
  MessageSquare,
  X,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/user-avatar"
import {
  useAdminFeedback,
  useUpdateFeedbackStatus,
  type AdminFeedbackItem,
} from "@/lib/hooks/use-admin-feedback"

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", className: "bg-red-100 text-red-600" },
}

const categoryConfig: Record<string, { label: string; className: string }> = {
  bug: { label: "Bug", className: "bg-red-50 text-red-600" },
  feature: { label: "Feature", className: "bg-purple-50 text-purple-600" },
  question: { label: "Question", className: "bg-blue-50 text-blue-600" },
  other: { label: "Other", className: "bg-gray-100 text-gray-600" },
}

const statusOptions = ["open", "in_progress", "resolved", "closed"]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function AdminFeedbackPage() {
  const { data: tickets, isLoading } = useAdminFeedback()
  const updateStatus = useUpdateFeedbackStatus()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedTicket, setSelectedTicket] = useState<AdminFeedbackItem | null>(null)
  const [adminNote, setAdminNote] = useState("")

  const filtered = (tickets ?? []).filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id: ticketId, status: newStatus })
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
  }

  const handleSendNote = async () => {
    if (!selectedTicket || !adminNote.trim()) return
    await updateStatus.mutateAsync({ id: selectedTicket.id, adminNote: adminNote.trim() })
    setSelectedTicket({ ...selectedTicket, adminNote: adminNote.trim() })
    setAdminNote("")
  }

  const openCount = (tickets ?? []).filter((t) => t.status === "open").length
  const inProgressCount = (tickets ?? []).filter((t) => t.status === "in_progress").length

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#EBEBEB] bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-400">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-medium text-gray-900">Feedback</span>
        </div>
        <div className="flex items-center gap-3">
          {openCount > 0 && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              {openCount} open
            </span>
          )}
          {inProgressCount > 0 && (
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              {inProgressCount} in progress
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Feedback & Issues
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage user-submitted feedback and issue reports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-lg border-[#EBEBEB] bg-[#F8F9FC] text-sm focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", ...statusOptions].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize border",
                  filterStatus === s
                    ? "bg-[#1E1B4B] text-white border-[#1E1B4B]"
                    : "bg-white text-gray-500 border-[#EBEBEB] hover:text-gray-900"
                )}
              >
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[14px] border border-[#EBEBEB] px-6 py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No feedback tickets found</p>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1E1B4B]">
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {filtered.map((ticket) => {
                    const status = statusConfig[ticket.status] ?? statusConfig.open
                    const cat = categoryConfig[ticket.category] ?? categoryConfig.other
                    return (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={ticket.user?.name}
                              image={ticket.user?.avatar ?? undefined}
                              size={32}
                              fallbackClassName="bg-[#4F46E5]"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {ticket.user?.name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {ticket.user?.email ?? ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 max-w-[200px] truncate">
                            {ticket.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cat.className)}>
                            {cat.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-[#4F46E5]/20",
                              status.className
                            )}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket)
                              setAdminNote(ticket.adminNote ?? "")
                            }}
                            className="text-xs border-[#EBEBEB]"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Slide-over */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedTicket(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Ticket Details
              </h2>
              <button onClick={() => setSelectedTicket(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              {/* User */}
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={selectedTicket.user?.name}
                  image={selectedTicket.user?.avatar ?? undefined}
                  size={40}
                  fallbackClassName="bg-[#4F46E5]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedTicket.user?.name ?? "Unknown"}</p>
                  <p className="text-xs text-gray-500">{selectedTicket.user?.email ?? ""}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  (categoryConfig[selectedTicket.category] ?? categoryConfig.other).className
                )}>
                  {(categoryConfig[selectedTicket.category] ?? categoryConfig.other).label}
                </span>
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  (statusConfig[selectedTicket.status] ?? statusConfig.open).className
                )}>
                  {(statusConfig[selectedTicket.status] ?? statusConfig.open).label}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(selectedTicket.createdAt)} at {formatTime(selectedTicket.createdAt)}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {selectedTicket.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Status Change */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                  className="w-full rounded-lg border border-[#EBEBEB] bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Admin Response
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  This note is visible to the user on their ticket.
                </p>
                {selectedTicket.adminNote && (
                  <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3 mb-3">
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {selectedTicket.adminNote}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Write a response to the user..."
                    rows={3}
                    className="flex-1 rounded-lg border border-[#EBEBEB] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] resize-none"
                  />
                </div>
                <button
                  onClick={handleSendNote}
                  disabled={updateStatus.isPending || !adminNote.trim()}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338CA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {selectedTicket.adminNote ? "Update Response" : "Send Response"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
