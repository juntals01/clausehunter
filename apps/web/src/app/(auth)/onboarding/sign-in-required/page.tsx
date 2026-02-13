"use client"

import Link from "next/link"
import { Sparkles, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function SignInRequiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBF5] gap-4 px-5 sm:px-8">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#E7E5E4]" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-6 sm:p-10 lg:p-14 w-full max-w-[520px] flex flex-col items-center gap-8">
        {/* Icon */}
        <div className="w-[72px] h-[72px] rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#16A34A]" />
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Analysis Complete!
          </h1>
          <p className="text-center text-[15px] text-[#78716C] max-w-[380px]">
            Sign in or create an account to view your full contract analysis
          </p>
        </div>

        {/* Results Summary */}
        <div className="w-full bg-[#F5F5F4] rounded-xl divide-y divide-[#E7E5E4]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#78716C]" />
              <span className="text-sm font-medium text-[#1C1917]">
                Vendor_Agreement_2024.pdf
              </span>
            </div>
            <span className="text-xs font-medium text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full">
              Analyzed
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#57534E]">
              3 renewal clauses found
            </span>
            <span className="text-xs font-medium text-[#EA580C] bg-[#FFF7ED] px-2.5 py-1 rounded-full">
              3 found
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#57534E]">
              Renewal date: March 15, 2027
            </span>
            <span className="text-xs font-medium text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full">
              Detected
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px bg-[#E7E5E4]" />
        </div>

        {/* Auth Actions */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* Google Button */}
          <button className="w-full border border-[#E7E5E4] rounded-xl py-3.5 flex items-center justify-center gap-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors">
            <span className="text-base font-bold">G</span>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-[#E7E5E4]" />
            <span className="text-sm text-[#A8A29E]">or</span>
            <div className="flex-1 h-px bg-[#E7E5E4]" />
          </div>

          {/* Sign Up Button */}
          <Button
            className="w-full bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold"
            asChild
          >
            <Link href="/sign-up">Sign up with Email</Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-[#78716C]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-[#EA580C] font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
