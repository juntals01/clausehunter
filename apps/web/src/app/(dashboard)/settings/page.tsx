"use client"

import { useState, useEffect } from "react"
import { Search, Upload, Save, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useUpdateProfile } from "@/lib/hooks/use-profile"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"

export default function SettingsPage() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

  const [name, setName] = useState("")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [reminderDays, setReminderDays] = useState(14)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  // Populate from real user data
  useEffect(() => {
    if (user) {
      setName(user.name)
    }
  }, [user])

  const handleSave = async () => {
    setError("")
    setSaved(false)
    try {
      await updateProfile.mutateAsync({ name })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save changes")
    }
  }

  const hasChanges = user && name !== user.name

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
            href="/upload"
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
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">Settings</h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Manage your account preferences
          </p>

          {/* Profile Section */}
          <div className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-lg border border-[#E7E5E4] bg-[#F5F5F4] px-4 py-2.5 text-sm text-[#78716C] cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-[#A8A29E]">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
              Notification Preferences
            </h2>
            <div className="space-y-5">
              {/* Email alerts toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1C1917]">Email Alerts</p>
                  <p className="text-xs text-[#78716C]">
                    Receive email notifications about upcoming renewals
                  </p>
                </div>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    emailAlerts ? "bg-[#EA580C]" : "bg-[#E7E5E4]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                      emailAlerts && "translate-x-5"
                    )}
                  />
                </button>
              </div>

              {/* Reminder days */}
              <div>
                <p className="text-sm font-medium text-[#1C1917] mb-2">
                  Reminder days before deadline
                </p>
                <div className="flex gap-3">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setReminderDays(days)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        reminderDays === days
                          ? "bg-[#EA580C] text-white"
                          : "border border-[#E7E5E4] text-[#78716C] hover:text-[#1C1917]"
                      )}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending || !hasChanges}
              className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
            {error && (
              <span className="text-sm text-red-600">{error}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
