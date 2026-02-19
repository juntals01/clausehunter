"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Download,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Eye,
  Pencil,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { Input } from "@/components/ui/input"
import {
  AddUserModal,
  UserDetailModal,
  EditUserModal,
  DeleteUserModal,
} from "./user-modals"
import { useUsers, useUserCount, type ApiUser } from "@/lib/hooks/use-users"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function capitalize(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

/* ------------------------------------------------------------------ */
/*  Badge maps                                                         */
/* ------------------------------------------------------------------ */

const roleBadge: Record<string, string> = {
  Admin: "bg-blue-100 text-blue-700",
  User: "bg-gray-100 text-gray-700",
  Editor: "bg-purple-100 text-purple-700",
}

const statusBadge: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-500",
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminUsersPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [viewUser, setViewUser] = useState<ApiUser | null>(null)
  const [editUser, setEditUser] = useState<ApiUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<ApiUser | null>(null)

  // Debounced search
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // API data
  const { data: users = [], isLoading, error } = useUsers(debouncedSearch || undefined)
  const { data: totalCount } = useUserCount()

  const allSelected = users.length > 0 && selected.length === users.length
  const someSelected = selected.length > 0

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.length === users.length ? [] : users.map((u) => u.id)
    )
  }, [users])

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#EBEBEB] bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-400">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-medium text-gray-900">Users</span>
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
          <Button variant="admin" size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        {/* Bulk Actions Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 rounded-lg border-[#EBEBEB] bg-white text-sm focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
            />
            Select All
          </label>
          {someSelected && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5 border-[#EBEBEB] text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 border-[#EBEBEB]">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-[14px] border border-[#EBEBEB] flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
            <span className="ml-2 text-sm text-gray-500">Loading users...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-white rounded-[14px] border border-red-200 flex items-center justify-center py-20">
            <p className="text-sm text-red-600">Failed to load users. Please try again.</p>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && !error && (
          <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1E1B4B]">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-[#A5B4FC]/40 bg-transparent text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="text-right text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      {debouncedSearch ? "No users found matching your search." : "No users found."}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const displayRole = capitalize(user.role)
                    const displayStatus = capitalize(user.status)

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="w-12 px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(user.id)}
                            onChange={() => toggleOne(user.id)}
                            className="h-4 w-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={user.name}
                              size={36}
                              fallbackClassName="bg-[#4F46E5]"
                              className="shrink-0"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              roleBadge[displayRole] || "bg-gray-100 text-gray-700"
                            )}
                          >
                            {displayRole}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              statusBadge[displayStatus] || "bg-gray-100 text-gray-500"
                            )}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatRelativeTime(user.lastActiveAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-gray-500 hover:text-[#4F46E5]"
                              onClick={() => setViewUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-gray-500 hover:text-[#4F46E5]"
                              onClick={() => setEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-gray-500 hover:text-red-600"
                              onClick={() => setDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#EBEBEB]">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {users.length > 0 ? "1" : "0"}–{users.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {totalCount?.toLocaleString() ?? users.length}
                </span>{" "}
                users
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-3 border-[#EBEBEB]" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="admin" size="sm" className="h-8 w-8 p-0">
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3 border-[#EBEBEB]" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal open={addOpen} onOpenChange={setAddOpen} />
      <UserDetailModal
        open={!!viewUser}
        onOpenChange={(open) => !open && setViewUser(null)}
        user={viewUser}
      />
      <EditUserModal
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
      />
      <DeleteUserModal
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        user={deleteUser}
      />
    </div>
  )
}
