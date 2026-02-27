"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { CircleCheck, FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getOnboardingSession,
  clearOnboardingSession,
} from "@/lib/stores/onboarding-store"

export default function OnboardingCompletePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [session] = useState(() => getOnboardingSession(id))

  // If no session, redirect home
  useEffect(() => {
    if (!session) {
      router.replace("/")
    }
  }, [session, router])

  // Clean up session on unmount (navigating away)
  useEffect(() => {
    return () => {
      clearOnboardingSession(id)
    }
  }, [id])

  if (!session) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBF5] gap-4 px-5 sm:px-8">
      {/* Step Indicator – all 3 filled */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-6 sm:p-10 lg:p-14 w-full max-w-[520px] flex flex-col items-center gap-8">
        <div className="w-20 h-20 rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center">
          <CircleCheck className="w-10 h-10 text-[#16A34A]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Your contract is ready!
          </h1>
          <p className="text-center text-[15px] text-[#78716C] max-w-[380px]">
            We&apos;ve analyzed your contract and extracted all clauses, dates,
            and key terms.
          </p>
        </div>

        <div className="bg-[#F5F5F4] rounded-xl px-5 py-3.5 flex items-center gap-3 w-full">
          <FileText className="w-5 h-5 text-[#78716C]" />
          <span className="text-sm font-medium text-[#1C1917] truncate max-w-[320px]">
            {session.fileName}
          </span>
          <span className="ml-auto text-xs font-medium text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full whitespace-nowrap">
            Complete
          </span>
        </div>

        <div className="w-full flex flex-col items-center gap-3">
          <Button
            className="w-full bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold"
            asChild
          >
            <Link
              href={
                session.contractId
                  ? `/dashboard/contracts/${session.contractId}`
                  : "/dashboard/contracts"
              }
            >
              View My Contract
            </Link>
          </Button>

          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#78716C] hover:text-[#EA580C] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Another
          </Link>
        </div>
      </div>
    </div>
  )
}
