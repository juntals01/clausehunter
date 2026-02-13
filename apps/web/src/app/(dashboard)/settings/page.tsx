"use client"

import { useState } from "react"
import { Search, Upload, Bell, Save } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john@example.com")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [reminderDays, setReminderDays] = useState(14)

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
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
          <div className="mt-6">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
