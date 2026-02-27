"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import {
  Search,
  Upload,
  CloudUpload,
  FileText,
  Sparkles,
  Check,
  Loader2,
  Circle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUploadContract } from "@/lib/hooks/use-contracts"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"

function dashedBorderStyle(color: string) {
  const encoded = color.replace("#", "%23")
  return {
    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='${encoded}' stroke-width='2' stroke-dasharray='16%2c 10' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`,
  }
}

type StepStatus = "done" | "active" | "pending"

interface ProcessingStep {
  label: string
  status: StepStatus
}

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadPhase, setUploadPhase] = useState<
    "idle" | "uploading" | "processing" | "done" | "error"
  >("idle")

  const router = useRouter()
  const uploadMutation = useUploadContract()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploadedFile(file)
      setUploadError(null)
      setUploadPhase("uploading")

      try {
        const contract = await uploadMutation.mutateAsync(file)
        setUploadPhase("processing")

        // Brief delay to show the processing state, then redirect
        setTimeout(() => {
          setUploadPhase("done")
          setTimeout(() => {
            router.push(`/dashboard/contracts/${contract.id}`)
          }, 1000)
        }, 1500)
      } catch (err: unknown) {
        setUploadPhase("error")
        const message =
          err instanceof Error ? err.message : "Upload failed. Please try again."
        setUploadError(message)
      }
    },
    [uploadMutation, router]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: uploadPhase === "uploading" || uploadPhase === "processing",
  })

  const steps: ProcessingStep[] = (() => {
    switch (uploadPhase) {
      case "uploading":
        return [
          { label: "Uploading...", status: "active" },
          { label: "Extracting text...", status: "pending" },
          { label: "Detecting renewal clauses...", status: "pending" },
          { label: "Computing cancel-by dates...", status: "pending" },
        ]
      case "processing":
        return [
          { label: "Uploading...", status: "done" },
          { label: "Extracting text...", status: "done" },
          { label: "Detecting renewal clauses...", status: "active" },
          { label: "Computing cancel-by dates...", status: "pending" },
        ]
      case "done":
        return [
          { label: "Uploading...", status: "done" },
          { label: "Extracting text...", status: "done" },
          { label: "Detecting renewal clauses...", status: "done" },
          { label: "Computing cancel-by dates...", status: "done" },
        ]
      default:
        return []
    }
  })()

  const isProcessing =
    uploadPhase === "uploading" ||
    uploadPhase === "processing" ||
    uploadPhase === "done"

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#E7E5E4]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full rounded-lg border border-[#E7E5E4] bg-white py-2 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex items-center gap-4 ml-4">
          <a
            href="/dashboard/upload"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </a>
          <NotificationDropdown />
          <div className="hidden sm:block"><UserDropdown /></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#1C1917]">
              Upload Document
            </h1>
            <p className="mt-1 text-sm text-[#78716C]">
              Upload your document and let AI extract key dates and clauses
            </p>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "rounded-2xl bg-white p-16 text-center transition-colors",
              isDragActive && "bg-orange-50/50",
              (uploadPhase === "uploading" || uploadPhase === "processing") &&
                "pointer-events-none opacity-60"
            )}
            style={dashedBorderStyle(isDragActive ? "#EA580C" : "rgba(234,88,12,0.4)")}
          >
            <input {...getInputProps()} />
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
              <CloudUpload className="h-8 w-8 text-[#EA580C]" />
            </div>
            <p className="text-lg font-semibold text-[#1C1917]">
              {isDragActive
                ? "Drop your PDF here..."
                : "Drop files here or click to browse"}
            </p>
            <p className="mt-2 text-sm text-[#78716C]">
              AI will auto-detect key dates and clauses
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                open()
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
            >
              <Upload className="h-4 w-4" />
              Browse Files
            </button>

            {/* File type indicators */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-xs text-[#78716C]">
                <FileText className="h-4 w-4" />
                PDF
              </div>
              <div className="flex items-center gap-2 text-xs text-[#78716C]">
                <Sparkles className="h-4 w-4 text-[#EA580C]" />
                AI Powered
              </div>
            </div>
          </div>

          {/* Error state */}
          {uploadPhase === "error" && uploadError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Upload Failed</p>
                  <p className="mt-1 text-sm text-red-600">{uploadError}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadPhase("idle")
                  setUploadError(null)
                  setUploadedFile(null)
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Processing section */}
          {isProcessing && (
            <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <p className="mb-4 text-sm font-semibold text-[#1C1917]">
                Processing:{" "}
                <span className="font-normal text-[#78716C]">
                  {uploadedFile?.name ?? "contract.pdf"}
                </span>
              </p>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {step.status === "done" && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    )}
                    {step.status === "active" && (
                      <div className="flex h-6 w-6 items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-[#EA580C]" />
                      </div>
                    )}
                    {step.status === "pending" && (
                      <div className="flex h-6 w-6 items-center justify-center">
                        <Circle className="h-4 w-4 text-[#E7E5E4]" />
                      </div>
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        step.status === "done"
                          ? "text-green-600"
                          : step.status === "active"
                            ? "text-[#EA580C] font-medium"
                            : "text-[#78716C]"
                      )}
                    >
                      {step.label}
                      {step.status === "done" && (
                        <span className="ml-2 text-green-600">Done</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {uploadPhase === "done" && (
                <p className="mt-4 text-sm font-medium text-green-600">
                  Redirecting to document details...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
