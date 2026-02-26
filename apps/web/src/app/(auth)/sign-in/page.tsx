"use client"

import Link from "next/link"
import { FileSearch, Star } from "lucide-react"
import { GoogleIcon } from "@/components/icons/google"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState, Suspense } from "react"

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect")
  const { login } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (values: SignInValues) => {
    setApiError(null)
    try {
      await login(values.email, values.password)
      // Read user from localStorage since login just set it
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        const savedUser = localStorage.getItem("user")
        const user = savedUser ? JSON.parse(savedUser) : null
        if (user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#EA580C] rounded-[10px] flex items-center justify-center">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-white">
            Expiration Reminder AI
          </span>
        </Link>

        {/* Testimonial */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 fill-[#EA580C] text-[#EA580C]"
              />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-white/90 text-lg leading-relaxed">
              <span className="text-[#EA580C] text-2xl font-serif">&ldquo;</span>
              Expiration Reminder AI saved us from a $12,000 auto-renewal we completely
              forgot about. It paid for itself in one contract.
              <span className="text-[#EA580C] text-2xl font-serif">&rdquo;</span>
            </p>
            <div>
              <p className="text-[#EA580C] font-medium">Sarah Chen</p>
              <p className="text-white/60 text-sm">
                Head of Operations, TechCorp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-[#FFFBF5] flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12">
        {/* Mobile Logo - visible only when left panel is hidden */}
        <Link href="/" className="flex items-center gap-2.5 mb-6 lg:hidden">
          <div className="w-8 h-8 bg-[#EA580C] rounded-[10px] flex items-center justify-center">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-[#1C1917]">
            Expiration Reminder AI
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-[0_4px_24px_-2px_rgba(15,23,42,0.07)] p-6 sm:p-[48px_56px] w-full max-w-[420px] flex flex-col items-center gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-[#1C1917]">
              Sign in to your account
            </h1>
            <p className="text-sm text-[#78716C] text-center">
              Welcome back! Enter your credentials to continue
            </p>
          </div>

          {/* Google Button */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            className="w-full border border-[#E7E5E4] rounded-xl py-3.5 flex items-center justify-center gap-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </a>

          {/* Divider */}
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

          {/* Form */}
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

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[#EA580C] text-sm font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
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
    </div>
  )
}
