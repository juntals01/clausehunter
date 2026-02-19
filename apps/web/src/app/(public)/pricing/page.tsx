"use client"

import Link from "next/link"
import { Check, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"
import { useState } from "react"

const VARIANT_IDS: Record<string, string> = {
  Pro: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PRO || "",
  Team: process.env.NEXT_PUBLIC_LS_VARIANT_ID_TEAM || "",
}

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out ExpirationReminderAI with a few contracts.",
    features: [
      "Up to 3 contracts",
      "Auto-renewal detection",
      "Basic email alerts",
      "7-day alert window",
      "PDF upload support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For professionals managing multiple active contracts.",
    features: [
      "Unlimited contracts",
      "Auto-renewal detection",
      "Advanced email alerts",
      "30 / 14 / 7-day alerts",
      "PDF + DOCX + scanned",
      "Confidence scores",
      "Clause preview & export",
      "Priority support",
    ],
    cta: "Get Started",
    highlighted: true,
    badge: "MOST POPULAR",
  },
  {
    name: "Team",
    price: "$49",
    description: "For teams that need shared access and admin controls.",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Admin dashboard",
      "Role-based access",
      "Team activity log",
      "Shared contract library",
      "SSO integration",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function PricingPage() {
  const { isAuthenticated } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleCheckout(planName: string) {
    const variantId = VARIANT_IDS[planName]
    if (!variantId) return

    setLoadingPlan(planName)
    try {
      const { data } = await api.post("/billing/checkout", {
        variantId,
        planName: planName.toLowerCase(),
      })
      window.location.href = data.checkoutUrl
    } catch (err) {
      console.error("Checkout error:", err)
      setLoadingPlan(null)
    }
  }

  function getHref(plan: typeof plans[number]) {
    if (plan.name === "Free") return "/sign-up"
    if (plan.name === "Team" && !isAuthenticated) return "/contact"
    if (!isAuthenticated) return `/sign-up?plan=${plan.name.toLowerCase()}`
    return "#"
  }

  function handleClick(plan: typeof plans[number]) {
    if (plan.name === "Free") return
    if (!isAuthenticated) return
    if (plan.name === "Team" && !VARIANT_IDS.Team) return
    handleCheckout(plan.name)
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 lg:px-[120px] pt-12 lg:pt-20 pb-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-base lg:text-[17px] text-[#78716C] leading-[1.7] max-w-[520px]">
            Start free with 3 contracts. Upgrade when you need more power — no
            hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 lg:px-[120px] py-10 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isLoading = loadingPlan === plan.name
            const isPaid = plan.name === "Pro" || plan.name === "Team"
            const href = getHref(plan)
            const useButton = isAuthenticated && isPaid

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 sm:p-8 bg-white",
                  plan.highlighted
                    ? "border-[#EA580C] shadow-lg"
                    : "border-[#E7E5E4]"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center bg-[#EA580C] text-white text-[11px] font-bold tracking-wider uppercase rounded-full px-4 py-1.5">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="font-display text-lg font-semibold text-[#1C1917] mb-1">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-[#1C1917]">
                    {plan.price}
                  </span>
                  <span className="text-[#78716C] text-sm">/month</span>
                </div>

                <p className="text-sm text-[#78716C] leading-relaxed mb-8">
                  {plan.description}
                </p>

                <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#16A34A]" />
                      </div>
                      <span className="text-sm text-[#44403C]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {useButton ? (
                  <button
                    onClick={() => handleClick(plan)}
                    disabled={isLoading}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 transition-colors w-full",
                      plan.highlighted
                        ? "bg-[#EA580C] text-white hover:bg-[#DC5409]"
                        : "border border-[#E7E5E4] bg-white text-[#1C1917] hover:bg-[#FAFAF9]",
                      isLoading && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={href}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 transition-colors w-full",
                      plan.highlighted
                        ? "bg-[#EA580C] text-white hover:bg-[#DC5409]"
                        : "border border-[#E7E5E4] bg-white text-[#1C1917] hover:bg-[#FAFAF9]"
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#FFF7ED] border-t border-[#FDBA74] px-5 sm:px-8 lg:px-[120px] py-10 lg:py-16">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] mb-3">
            Not sure which plan is right for you?
          </h2>
          <p className="text-[15px] text-[#78716C] mb-6 max-w-[400px]">
            Start free and upgrade anytime. No credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-[#EA580C] text-white font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 hover:bg-[#DC5409] transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
