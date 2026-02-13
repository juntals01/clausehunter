"use client"

import { useState } from "react"
import {
  Search,
  Download,
  ChevronRight,
  FileText,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminContracts, useAdminDeleteContract, type AdminContract } from "@/lib/hooks/use-admin-contracts"

const statusStyles: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-700",
  processing: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
  queued: "bg-gray-100 text-gray-500",
}

const statusLabel: Record<string, string> = {
  ready: "Completed",
  processing: "Processing",
  failed: "Failed",
  queued: "Pending",
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function AdminContractsPage() {
  const [searchInput, setSearchInput] = useState("")
  const { data: contracts, isLoading, error } = useAdminContracts()
  const deleteContract = useAdminDeleteContract()

  const filtered = contracts?.filter(
    (c) =>
      !searchInput ||
      c.originalFilename.toLowerCase().includes(searchInput.toLowerCase()) ||
      c.vendor?.toLowerCase().includes(searchInput.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(searchInput.toLowerCase())
  )

  const handleDelete = async (contract: AdminContract) => {
    if (!confirm(`Delete contract "${contract.originalFilename}"?`)) return
    await deleteContract.mutateAsync(contract.id)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#EBEBEB] bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-400">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-medium text-gray-900">Contracts</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-64 h-9 rounded-lg border-[#EBEBEB] bg-[#F8F9FC] text-sm focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 border-[#EBEBEB]">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all contracts across the platform.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-600">
            Failed to load contracts
          </div>
        )}

        {filtered && (
          <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1E1B4B]">
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Contract Name
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Renewal Date
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Analysis Status
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-right text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      No contracts found
                    </td>
                  </tr>
                )}
                {filtered.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#F0EFFE] flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-[#4F46E5]" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {contract.originalFilename}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contract.vendor || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(contract.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          statusStyles[contract.status] || "bg-gray-100 text-gray-500"
                        )}
                      >
                        {statusLabel[contract.status] || contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {contract.user ? (
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                            {getInitials(contract.user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contract.user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {contract.user.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-gray-500 hover:text-[#4F46E5]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-gray-500 hover:text-red-600"
                          onClick={() => handleDelete(contract)}
                          disabled={deleteContract.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#EBEBEB]">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {filtered.length}
                </span>{" "}
                contract{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
