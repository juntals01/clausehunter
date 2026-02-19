"use client"

import Link from "next/link"
import { FileSearch, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import api from "@/lib/api"

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (values: ResetPasswordValues) => {
    setApiError(null)
    if (!token) {
      setApiError("Missing reset token. Please use the link from your email.")
      return
    }
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: values.newPassword,
      })
      setSuccess(true)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again."
      setApiError(typeof message === "string" ? message : message[0])
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-2xl font-bold">!</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#1C1917]">
          Invalid Reset Link
        </h1>
        <p className="text-sm text-[#78716C] text-center">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="text-[#EA580C] text-sm font-medium hover:underline"
        >
          Request New Reset Link
        </Link>
      </div>
    )
  }

  return (
    <>
      {success ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Password Reset!
          </h1>
          <p className="text-sm text-[#78716C] text-center">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Link href="/sign-in">
            <Button className="bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold px-8">
              Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-[#1C1917]">
              Set new password
            </h1>
            <p className="text-sm text-[#78716C] text-center">
              Choose a strong password for your account
            </p>
          </div>

          {apiError && (
            <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
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
    </>
  )
}

export default function ResetPasswordPage() {
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
            Almost there! Choose a new password and you&apos;ll be back on track.
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
          <Suspense fallback={<div className="text-sm text-[#78716C]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
