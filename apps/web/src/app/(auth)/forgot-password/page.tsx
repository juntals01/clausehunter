"use client"

import Link from "next/link"
import { FileSearch, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import api from "@/lib/api"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    setApiError(null)
    try {
      await api.post("/auth/forgot-password", { email: values.email })
      setSubmitted(true)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again."
      setApiError(typeof message === "string" ? message : message[0])
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[560px] shrink-0 bg-gradient-to-b from-[#1C1917] via-[#431407] to-[#7C2D12] p-[60px_56px] flex-col justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#EA580C] rounded-[10px] flex items-center justify-center">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-white">
            Expiration Reminder AI
          </span>
        </Link>

        <div className="flex flex-col gap-4">
          <p className="text-white/90 text-lg leading-relaxed">
            Don&apos;t worry, it happens to the best of us. We&apos;ll help you get back into your account.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-[#FFFBF5] flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12">
        <Link href="/" className="flex items-center gap-2.5 mb-6 lg:hidden">
          <div className="w-8 h-8 bg-[#EA580C] rounded-[10px] flex items-center justify-center">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-[#1C1917]">
            Expiration Reminder AI
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-[0_4px_24px_-2px_rgba(15,23,42,0.07)] p-6 sm:p-[48px_56px] w-full max-w-[420px] flex flex-col items-center gap-8">
          {submitted ? (
            <>
              {/* Success State */}
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-[#1C1917]">
                  Check your email
                </h1>
                <p className="text-sm text-[#78716C] text-center">
                  If an account exists with that email, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
                </p>
              </div>
              <Link
                href="/sign-in"
                className="text-[#EA580C] text-sm font-medium hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </>
          ) : (
            <>
              {/* Form State */}
              <div className="flex flex-col items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-[#1C1917]">
                  Forgot your password?
                </h1>
                <p className="text-sm text-[#78716C] text-center">
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {apiError && (
                <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <Link
                href="/sign-in"
                className="text-[#EA580C] text-sm font-medium hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
