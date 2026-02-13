"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const contractRanges = ["1-10", "11-50", "51-200", "200+"] as const

export default function AddDetailsPage() {
  const [selectedRange, setSelectedRange] = useState<string>("1-10")
  const [remindersEnabled, setRemindersEnabled] = useState(true)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBF5] gap-4 px-5 sm:px-8">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-6 sm:p-10 lg:p-14 w-full max-w-[520px] flex flex-col items-center gap-8">
        {/* Title & Subtitle */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Complete your profile
          </h1>
          <p className="text-center text-[15px] text-[#78716C] max-w-[380px]">
            Help us personalize your experience
          </p>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              defaultValue="John Doe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company">Company / Organization</Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Corp"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="procurement">Procurement</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contract Count Chips */}
          <div className="flex flex-col gap-2">
            <Label>How many contracts do you manage?</Label>
            <div className="flex gap-2">
              {contractRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                    selectedRange === range
                      ? "bg-[#FFF7ED] border-[#EA580C] text-[#EA580C]"
                      : "bg-white border-[#E7E5E4] text-[#57534E] hover:border-[#D6D3D1]"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Renewal Reminders Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[#1C1917]">
                Renewal reminders
              </span>
              <span className="text-xs text-[#A8A29E]">
                Get notified before contracts renew
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={remindersEnabled}
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                remindersEnabled ? "bg-[#EA580C]" : "bg-[#D6D3D1]"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform",
                  remindersEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold"
          >
            Continue to Dashboard
          </Button>
        </form>

        {/* Skip Link */}
        <Link
          href="/dashboard"
          className="text-sm text-[#78716C] hover:text-[#57534E] transition-colors"
        >
          Skip for now
        </Link>
      </div>
    </div>
  )
}
