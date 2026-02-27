"use client"

import { useState } from "react"
import {
  Search,
  Upload,
  Shield,
  AlertTriangle,
  Lock,
  Trash2,
  Loader2,
  Check,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUpdateProfile } from "@/lib/hooks/use-profile"
import { UserAvatar } from "@/components/user-avatar"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"

export default function AccountPage() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    try {
      await updateProfile.mutateAsync({
        currentPassword: currentPassword || undefined,
        newPassword,
      })
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to change password")
    }
  }

  const isGoogleOnly = user && !user.company && user.avatar // rough heuristic, but password field visibility handled below

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-[#E7E5E4]">
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
            href="/dashboard/upload"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload contract
          </a>
          <NotificationDropdown />
          <div className="hidden sm:block">
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-8 pb-8 pt-6 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">Account</h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Manage your profile and security
          </p>

          {/* Profile Card */}
          <div className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <div className="flex items-center gap-5">
              <UserAvatar size={64} />
              <div>
                <h2 className="font-display text-lg font-semibold text-[#1C1917]">
                  {user?.name ?? "—"}
                </h2>
                <p className="text-sm text-[#78716C]">{user?.email ?? "—"}</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-[#EA580C] capitalize">
                  {user?.role ?? "user"}
                </span>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-[#78716C]" />
              <h2 className="font-display text-base font-semibold text-[#1C1917]">
                Security
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
                <p className="mt-1 text-xs text-[#78716C]">
                  Leave blank if you signed up with Google and haven&apos;t set a password yet.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="flex items-center gap-1.5 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Password changed successfully
                </p>
              )}

              <button
                onClick={handleChangePassword}
                disabled={updateProfile.isPending || !newPassword}
                className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Change Password
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="font-display text-base font-semibold text-red-700">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm text-red-600/80 mb-4">
              Permanently delete your account and all associated data. This action cannot
              be undone.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
