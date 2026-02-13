"use client"

import { useState } from "react"
import {
  Search,
  Upload,
  Bell,
  User,
  Shield,
  AlertTriangle,
  Lock,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AccountPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#E7E5E4]">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search contracts..."
            className="w-full rounded-lg border border-[#E7E5E4] bg-white py-2 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload contract
          </a>
          <button className="relative rounded-lg p-2 text-[#78716C] hover:bg-white hover:text-[#1C1917] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EA580C]" />
          </button>
          <div className="h-8 w-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-sm font-medium">
            JD
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pb-8 pt-6 space-y-6">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">Account</h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Manage your profile and security
          </p>

          {/* Profile Card */}
          <div className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EA580C] text-white text-xl font-bold font-display">
                JD
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-[#1C1917]">
                  John Doe
                </h2>
                <p className="text-sm text-[#78716C]">john@example.com</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-[#EA580C]">
                  Pro Member
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
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
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
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors">
                <Lock className="h-4 w-4" />
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
