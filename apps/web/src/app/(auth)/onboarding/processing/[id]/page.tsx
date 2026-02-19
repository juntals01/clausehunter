"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ScanSearch, FileText, CircleCheck, Loader, Circle } from "lucide-react"
import {
  getOnboardingSession,
  getOnboardingFileAsync,
  updateOnboardingSession,
} from "@/lib/stores/onboarding-store"
import { useAuth } from "@/lib/auth-context"
import { useUploadContract } from "@/lib/hooks/use-contracts"

interface Step {
  activeLabel: string
  doneLabel: string
  status: "pending" | "active" | "done"
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProcessingPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const uploadMutation = useUploadContract()
  const uploadRef = useRef(uploadMutation)
  uploadRef.current = uploadMutation

  // Load session from sessionStorage AFTER mount to avoid hydration mismatch
  // (sessionStorage doesn't exist on the server)
  const [session, setSession] = useState<ReturnType<typeof getOnboardingSession>>(null)
  const [mounted, setMounted] = useState(false)
  const uploadingRef = useRef(false) // guards the upload call only

  useEffect(() => {
    setSession(getOnboardingSession(id))
    setMounted(true)
  }, [id])

  const [steps, setSteps] = useState<Step[]>([
    { activeLabel: "Uploading contract...", doneLabel: "Contract uploaded", status: "active" },
    { activeLabel: "Extracting text & clauses...", doneLabel: "Clauses extracted", status: "pending" },
    { activeLabel: "Detecting key dates...", doneLabel: "Key dates detected", status: "pending" },
  ])
  const [progress, setProgress] = useState(10)

  // If no session exists for this ID, redirect home (wait for mount so sessionStorage is read first)
  useEffect(() => {
    if (mounted && !authLoading && !session) {
      router.replace("/")
    }
  }, [mounted, authLoading, session, router])

  // If session is already complete, redirect to complete page
  useEffect(() => {
    if (session?.status === "complete" && session.contractId) {
      router.replace(`/onboarding/complete/${id}`)
    }
  }, [session, id, router])

  // Authenticated flow: upload the file for real
  useEffect(() => {
    if (authLoading || !session || !isAuthenticated) return
    if (uploadingRef.current) return // prevent duplicate uploads
    uploadingRef.current = true

    let cancelled = false

    async function upload() {
      try {
        // Try in-memory first, then IndexedDB (survives OAuth redirects)
        const file = await getOnboardingFileAsync(id)

        // If file is gone but we already have a contractId, go to complete
        if (!file && session!.contractId) {
          router.replace(`/onboarding/complete/${id}`)
          return
        }

        // If file is gone and no contractId, redirect to upload page
        if (!file) {
          router.replace("/upload")
          return
        }

        setProgress(25)
        updateOnboardingSession(id, { status: "uploading" })
        const contract = await uploadRef.current.mutateAsync(file)
        if (cancelled) return

        setSteps((s) => [
          { ...s[0], status: "done" },
          { ...s[1], status: "active" },
          s[2],
        ])
        setProgress(60)

        await new Promise((r) => setTimeout(r, 800))
        if (cancelled) return

        setSteps((s) => [
          s[0],
          { ...s[1], status: "done" },
          { ...s[2], status: "active" },
        ])
        setProgress(85)

        await new Promise((r) => setTimeout(r, 600))
        if (cancelled) return

        setSteps((s) => [s[0], s[1], { ...s[2], status: "done" }])
        setProgress(100)

        updateOnboardingSession(id, { contractId: contract.id, status: "complete" })

        await new Promise((r) => setTimeout(r, 400))
        if (cancelled) return
        router.replace(`/onboarding/complete/${id}`)
      } catch {
        if (!cancelled) router.replace("/upload")
      }
    }

    upload()

    return () => {
      cancelled = true
      // NOTE: Do NOT reset uploadingRef here.
      // React Strict Mode re-runs effects in dev — resetting the ref
      // would allow a second upload, creating duplicate contracts.
    }
  }, [authLoading, isAuthenticated, session, id, router])

  // Unauthenticated flow: show fake progress, then redirect to sign-in-required
  useEffect(() => {
    if (authLoading || !session || isAuthenticated) return

    const timers: NodeJS.Timeout[] = []

    timers.push(
      setTimeout(() => {
        setSteps((s) => [
          { ...s[0], status: "done" },
          { ...s[1], status: "active" },
          s[2],
        ])
        setProgress(40)
      }, 1000)
    )

    timers.push(
      setTimeout(() => {
        setSteps((s) => [
          s[0],
          { ...s[1], status: "done" },
          { ...s[2], status: "active" },
        ])
        setProgress(70)
      }, 2200)
    )

    timers.push(
      setTimeout(() => {
        setSteps((s) => [s[0], s[1], { ...s[2], status: "done" }])
        setProgress(100)
      }, 3200)
    )

    timers.push(
      setTimeout(() => {
        updateOnboardingSession(id, { status: "sign-in-required" })
        router.replace(`/onboarding/sign-in-required/${id}`)
      }, 4000)
    )

    return () => timers.forEach(clearTimeout)
  }, [authLoading, isAuthenticated, session, id, router])

  if (!session) return null

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
        <div className="w-20 h-20 rounded-full bg-[#FFF7ED] border-2 border-[#FDBA74] flex items-center justify-center">
          <ScanSearch className="w-9 h-9 text-[#EA580C]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Analyzing your contract...
          </h1>
          <p className="text-center text-[15px] text-[#78716C] max-w-[380px]">
            Our AI is scanning for clauses, renewal dates, and key terms
          </p>
        </div>

        <div className="bg-[#F5F5F4] rounded-xl px-5 py-3.5 flex items-center gap-3 w-full">
          <FileText className="w-5 h-5 text-[#78716C]" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#1C1917] truncate max-w-[320px]">
              {session.fileName}
            </span>
            <span className="text-xs text-[#A8A29E]">
              {formatFileSize(session.fileSize)}
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <div className="bg-[#F5F5F4] h-1.5 rounded-full w-full">
            <div
              className="bg-[#EA580C] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-[#78716C] text-center">
            Processing... {progress}%
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          {steps.map((step) => (
            <div key={step.activeLabel} className="flex items-center gap-3">
              {step.status === "done" && (
                <CircleCheck className="w-5 h-5 text-[#16A34A]" />
              )}
              {step.status === "active" && (
                <Loader className="w-5 h-5 text-[#EA580C] animate-spin" />
              )}
              {step.status === "pending" && (
                <Circle className="w-5 h-5 text-[#D6D3D1]" />
              )}
              <span
                className={
                  step.status === "done"
                    ? "text-sm text-[#1C1917]"
                    : step.status === "active"
                      ? "text-sm text-[#EA580C]"
                      : "text-sm text-[#A8A29E]"
                }
              >
                {step.status === "done" ? step.doneLabel : step.activeLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[13px] text-[#A8A29E]">
        This usually takes less than 30 seconds
      </p>
    </div>
  )
}
