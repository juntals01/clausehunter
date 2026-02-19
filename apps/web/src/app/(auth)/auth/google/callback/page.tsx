"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth, type User } from "@/lib/auth-context"
import { findActiveOnboardingSessionId } from "@/lib/stores/onboarding-store"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken } = useAuth()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const token = searchParams.get("token")
    const userParam = searchParams.get("user")

    if (!token || !userParam) {
      router.replace("/sign-in?error=google-auth-failed")
      return
    }

    try {
      const user: User = JSON.parse(userParam)
      loginWithToken(token, user)

      // Check if there's a pending onboarding session
      const sessionId = findActiveOnboardingSessionId()

      if (sessionId) {
        // Redirect to processing page to complete the upload
        router.replace(`/onboarding/processing/${sessionId}`)
      } else if (user.role === "admin") {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    } catch {
      router.replace("/sign-in?error=google-auth-failed")
    }
  }, [searchParams, loginWithToken, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBF5]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
        <p className="text-sm text-gray-500">Signing you in with Google...</p>
      </div>
    </div>
  )
}
