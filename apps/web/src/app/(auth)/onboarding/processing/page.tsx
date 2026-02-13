"use client"

import { ScanSearch, FileText, CircleCheck, Loader, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProcessingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBF5] gap-4 px-5 sm:px-8">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#E7E5E4]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#E7E5E4]" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-6 sm:p-10 lg:p-14 w-full max-w-[520px] flex flex-col items-center gap-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#FFF7ED] border-2 border-[#FDBA74] flex items-center justify-center">
          <ScanSearch className="w-9 h-9 text-[#EA580C]" />
        </div>

        {/* Title & Subtitle */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Analyzing your contract...
          </h1>
          <p className="text-center text-[15px] text-[#78716C] max-w-[380px]">
            Our AI is scanning for clauses, renewal dates, and key terms
          </p>
        </div>

        {/* File Card */}
        <div className="bg-[#F5F5F4] rounded-xl px-5 py-3.5 flex items-center gap-3 w-full">
          <FileText className="w-5 h-5 text-[#78716C]" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#1C1917]">
              Vendor_Agreement_2024.pdf
            </span>
            <span className="text-xs text-[#A8A29E]">2.4 MB</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-2">
          <div className="bg-[#F5F5F4] h-1.5 rounded-full w-full">
            <div className="bg-[#EA580C] h-1.5 rounded-full w-[64%] transition-all" />
          </div>
          <p className="text-sm text-[#78716C] text-center">
            Processing... 64%
          </p>
        </div>

        {/* Status List */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <CircleCheck className="w-5 h-5 text-[#16A34A]" />
            <span className="text-sm text-[#1C1917]">
              Renewal clauses detected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Loader className="w-5 h-5 text-[#EA580C] animate-spin" />
            <span className="text-sm text-[#EA580C]">
              Scanning penalty clauses...
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Circle className="w-5 h-5 text-[#D6D3D1]" />
            <span className="text-sm text-[#A8A29E]">
              Extracting key dates
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <p className="text-[13px] text-[#A8A29E]">
        This usually takes less than 30 seconds
      </p>
    </div>
  )
}
