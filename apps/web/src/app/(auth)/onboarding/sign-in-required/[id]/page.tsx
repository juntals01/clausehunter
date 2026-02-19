"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/icons/google"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/lib/auth-context"
import { useUploadContract } from "@/lib/hooks/use-contracts"
import {
  getOnboardingSession,
  getOnboardingFileAsync,
  updateOnboardingSession,
} from "@/lib/stores/onboarding-store"

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignInRequiredPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { login } = useAuth()
  const uploadMutation = useUploadContract()
  const [session] = useState(() => getOnboardingSession(id))
  const [apiError, setApiError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  // If no session, redirect home
  useEffect(() => {
    if (!session) {
      router.replace("/")
    }
  }, [session, router])

  const onSubmit = async (values: SignInValues) => {
    setApiError(null)
    try {
      await login(values.email, values.password)

      // Try to upload the file directly after login (check memory + IndexedDB)
      const file = await getOnboardingFileAsync(id)
      if (file) {
        setIsUploading(true)
        const contract = await uploadMutation.mutateAsync(file)
        updateOnboardingSession(id, { contractId: contract.id, status: "complete" })
        router.push(`/onboarding/complete/${id}`)
      } else {
        // File lost from memory (page refresh, HMR, etc.)
        // Redirect to processing — it will handle the no-file case
        router.push(`/onboarding/processing/${id}`)
      }
    } catch (error: unknown) {
      setIsUploading(false)
      const err = error as { response?: { data?: { message?: string | string[] } }; message?: string }
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again."
      setApiError(typeof message === "string" ? message : message[0])
    }
  }

  if (!session) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBF5] gap-4 px-5 sm:px-8">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#EA580C]" />
        <div className="w-8 h-1.5 rounded-[3px] bg-[#E7E5E4]" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-6 sm:p-10 lg:p-14 w-full max-w-[520px] flex flex-col items-center gap-6">
        <div className="w-[72px] h-[72px] rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#16A34A]" />
        </div>

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
              <span className="text-sm font-medium text-[#1C1917] truncate max-w-[240px]">
                {session.fileName}
              </span>
            </div>
            <span className="text-xs font-medium text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full">
              Analyzed
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#57534E]">
              Clauses &amp; dates ready
            </span>
            <span className="text-xs font-medium text-[#EA580C] bg-[#FFF7ED] px-2.5 py-1 rounded-full">
              Ready
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px bg-[#E7E5E4]" />
        </div>

        {/* Google Button */}
        <a
          href={`${apiUrl}/auth/google`}
          className="w-full border border-[#E7E5E4] rounded-xl py-3.5 flex items-center justify-center gap-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
        >
          <GoogleIcon className="w-5 h-5" />
          Continue with Google
        </a>

        {/* Or divider */}
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px bg-[#E7E5E4]" />
          <span className="text-sm text-[#A8A29E]">or</span>
          <div className="flex-1 h-px bg-[#E7E5E4]" />
        </div>

        {/* API Error */}
        {apiError && (
          <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold"
          >
            {isUploading
              ? "Uploading contract..."
              : isSubmitting
                ? "Signing in..."
                : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-sm text-[#78716C]">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-[#EA580C] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
