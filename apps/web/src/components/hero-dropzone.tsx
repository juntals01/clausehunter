"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useDropzone, type FileRejection } from "react-dropzone"
import { CloudUpload, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createOnboardingSession } from "@/lib/stores/onboarding-store"

export function HeroDropzone() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setError(null)
      // Create a session (persists to sessionStorage + keeps File in memory)
      const sessionId = createOnboardingSession(acceptedFiles[0])
      router.push(`/onboarding/processing/${sessionId}`)
    },
    [router]
  )

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    if (rejections.length > 0) {
      setError("Unsupported file format. Please upload a PDF, DOC, or DOCX file.")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "w-full max-w-[420px] md:max-w-none md:flex-1 bg-white rounded-[20px] border-2 p-8 sm:p-[40px_36px] lg:p-[48px_44px] shadow-[0_8px_32px_-4px_rgba(234,88,12,0.06)] flex flex-col items-center gap-3.5 cursor-pointer transition-colors",
        isDragActive
          ? "border-[#EA580C] bg-orange-50/50"
          : error
            ? "border-red-400 hover:border-red-500"
            : "border-[#FDBA74] hover:border-[#EA580C]/60"
      )}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#FFF7ED] flex items-center justify-center">
        <CloudUpload className="w-7 h-7 lg:w-9 lg:h-9 text-[#EA580C]" />
      </div>
      <h3 className="font-display text-lg lg:text-xl font-bold text-[#1C1917]">
        {isDragActive ? "Drop your file here..." : "Drop your contract here"}
      </h3>
      <p className="text-sm lg:text-base text-[#78716C] text-center">
        AI detects clauses &amp; renewal dates instantly
      </p>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 w-full">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center bg-[#EA580C] text-white font-display font-semibold text-sm rounded-[10px] py-3 lg:py-3.5 px-7 lg:px-9 hover:bg-[#DC5409] transition-colors"
      >
        Browse Files
      </button>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-xs text-[#A8A29E]">PDF</span>
        <span className="w-1 h-1 rounded-full bg-[#D6D3D1]" />
        <span className="text-xs text-[#A8A29E]">DOC / DOCX</span>
        <span className="w-1 h-1 rounded-full bg-[#D6D3D1]" />
        <span className="text-xs text-[#A8A29E]">Scanned</span>
      </div>
    </div>
  )
}
