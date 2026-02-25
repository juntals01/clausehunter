"use client"

import { Settings, Construction } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E5E7EB]">
        <div>
          <h1 className="font-display text-xl font-bold text-[#1E1B4B]">Settings</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Platform configuration</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-20">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EEF2FF] mb-4">
          <Construction className="w-7 h-7 text-[#4F46E5]" />
        </div>
        <h2 className="font-display text-lg font-semibold text-[#1E1B4B] mb-2">Coming Soon</h2>
        <p className="text-sm text-[#6B7280] text-center max-w-sm">
          Admin settings are under development. This will include platform configuration, notification preferences, and system maintenance tools.
        </p>
      </div>
    </div>
  )
}
