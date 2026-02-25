"use client"

import { Suspense, useEffect, useState } from "react"
import {
  Search,
  Upload,
  CreditCard,
  FileText,
  Zap,
  Loader2,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Crown,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useContracts } from "@/lib/hooks/use-contracts"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { PLAN_LIMITS } from "@expirationreminderai/shared"
import type { PlanName } from "@expirationreminderai/shared"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

interface SubscriptionData {
  id: string
  lsSubscriptionId: string
  planName: string
  status: string
  cardBrand: string | null
  cardLastFour: string | null
  renewsAt: string | null
  endsAt: string | null
  trialEndsAt: string | null
  updatePaymentMethodUrl: string | null
  createdAt: string
}

interface BillingData {
  plan: PlanName
  status: string
  subscription: SubscriptionData | null
}

const VARIANT_IDS: Record<string, string> = {
  pro: process.env.NEXT_PUBLIC_LS_VARIANT_ID_PRO || "",
  team: process.env.NEXT_PUBLIC_LS_VARIANT_ID_TEAM || "",
}

const PLAN_DISPLAY: Record<string, { label: string; color: string; bgColor: string }> = {
  free: { label: "Free Plan", color: "text-[#78716C]", bgColor: "bg-[#FAFAF9]" },
  pro: { label: "Pro Plan", color: "text-[#EA580C]", bgColor: "bg-orange-50" },
  team: { label: "Team Plan", color: "text-[#7C3AED]", bgColor: "bg-purple-50" },
}

function BillingContent() {
  const { user } = useAuth()
  const { data: contracts, isLoading: contractsLoading } = useContracts()
  const searchParams = useSearchParams()
  const [billing, setBilling] = useState<BillingData | null>(null)
  const [billingLoading, setBillingLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const checkoutSuccess = searchParams.get("checkout") === "success"

  const totalContracts = contracts?.length ?? 0

  useEffect(() => {
    api
      .get("/billing/subscription")
      .then((res) => setBilling(res.data))
      .catch(() => setBilling({ plan: "free", status: "active", subscription: null }))
      .finally(() => setBillingLoading(false))
  }, [])

  async function handleUpgrade(planName: string) {
    const variantId = VARIANT_IDS[planName]
    if (!variantId) return

    setUpgrading(planName)
    try {
      const { data } = await api.post("/billing/checkout", {
        variantId,
        planName,
      })
      window.location.href = data.checkoutUrl
    } catch (err) {
      console.error("Checkout error:", err)
      setUpgrading(null)
    }
  }

  const plan = billing?.plan || "free"
  const sub = billing?.subscription
  const display = PLAN_DISPLAY[plan] || PLAN_DISPLAY.free
  const limit = PLAN_LIMITS[plan]
  const isPaid = plan !== "free"

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-[#E7E5E4]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search contracts..."
            className="w-full rounded-lg border border-[#E7E5E4] bg-white py-2 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex items-center gap-4 ml-4">
          <a
            href="/upload"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload contract
          </a>
          <NotificationDropdown />
          <div className="hidden sm:block">
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-8 pb-8 pt-6 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">Billing</h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Manage your subscription and payments
          </p>

          {/* Checkout Success Banner */}
          {checkoutSuccess && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Payment successful!
                </p>
                <p className="text-xs text-green-700">
                  Your subscription is now active. It may take a moment for changes to appear.
                </p>
              </div>
            </div>
          )}

          {/* Current Plan */}
          {billingLoading ? (
            <div className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <div className="flex items-center gap-2 text-sm text-[#78716C]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading subscription...
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", display.bgColor)}>
                    {isPaid ? (
                      <Crown className={cn("h-6 w-6", display.color)} />
                    ) : (
                      <Zap className="h-6 w-6 text-[#EA580C]" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#1C1917]">
                      {display.label}
                    </h2>
                    <p className="text-sm text-[#78716C]">
                      {isPaid
                        ? `Status: ${sub?.status === "active" ? "Active" : sub?.status || "Active"}`
                        : "You're on the free tier"}
                    </p>
                    {sub?.renewsAt && sub.status === "active" && (
                      <p className="mt-1 text-xs text-[#78716C]">
                        Renews on {new Date(sub.renewsAt).toLocaleDateString()}
                      </p>
                    )}
                    {sub?.endsAt && sub.status === "cancelled" && (
                      <p className="mt-1 text-xs text-amber-600">
                        Access until {new Date(sub.endsAt).toLocaleDateString()}
                      </p>
                    )}
                    {!isPaid && (
                      <p className="mt-1 text-xs text-[#78716C]">
                        Upgrade to unlock unlimited contracts and premium features.
                      </p>
                    )}
                  </div>
                </div>
                {!isPaid && (
                  <button
                    onClick={() => handleUpgrade("pro")}
                    disabled={upgrading === "pro"}
                    className="rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {upgrading === "pro" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Upgrade
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Usage */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
              Usage
            </h2>
            {contractsLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#78716C]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#78716C]">Contracts uploaded</span>
                  <span className="text-sm font-medium text-[#1C1917]">
                    {totalContracts}{limit !== Infinity ? ` / ${limit}` : ""}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E7E5E4] overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      limit !== Infinity && totalContracts >= limit
                        ? "bg-red-500"
                        : "bg-[#EA580C]"
                    )}
                    style={{
                      width: limit === Infinity
                        ? `${Math.min(totalContracts * 2, 100)}%`
                        : `${Math.min((totalContracts / limit) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#78716C]">
                  {limit === Infinity
                    ? `${totalContracts} contract${totalContracts !== 1 ? "s" : ""} uploaded — unlimited on your plan`
                    : `${totalContracts} of ${limit} contracts used`}
                </p>
                {limit !== Infinity && totalContracts >= limit && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    You&apos;ve reached your limit.{" "}
                    <button
                      onClick={() => handleUpgrade("pro")}
                      className="underline hover:no-underline"
                    >
                      Upgrade to Pro
                    </button>{" "}
                    for unlimited contracts.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Payment Method */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAFAF9] border border-[#E7E5E4]">
                  <CreditCard className="h-5 w-5 text-[#78716C]" />
                </div>
                <div>
                  {sub?.cardBrand && sub?.cardLastFour ? (
                    <>
                      <p className="text-sm font-medium text-[#1C1917] capitalize">
                        {sub.cardBrand} ending in {sub.cardLastFour}
                      </p>
                      <p className="text-xs text-[#78716C]">
                        Your payment method on file
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-[#1C1917]">
                        No payment method
                      </p>
                      <p className="text-xs text-[#78716C]">
                        {isPaid
                          ? "Payment method will appear after your first charge"
                          : "Add a payment method to upgrade your plan"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {sub?.updatePaymentMethodUrl && (
                <a
                  href={sub.updatePaymentMethodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#EA580C] hover:underline inline-flex items-center gap-1"
                >
                  Update
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Billing History */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E5E4]">
              <h2 className="font-display text-base font-semibold text-[#1C1917]">
                Billing History
              </h2>
            </div>
            {sub ? (
              <div className="px-6 py-4">
                <div className="flex items-center justify-between py-3 border-b border-[#F5F5F4] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#1C1917]">
                      {PLAN_DISPLAY[sub.planName]?.label || sub.planName} subscription
                    </p>
                    <p className="text-xs text-[#78716C]">
                      Started {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    sub.status === "active"
                      ? "bg-green-50 text-green-700"
                      : sub.status === "cancelled"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                  )}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <FileText className="h-10 w-10 text-[#D6D3D1] mx-auto mb-3" />
                <p className="text-sm text-[#78716C]">No billing history yet</p>
                <p className="text-xs text-[#A8A29E] mt-1">
                  Invoices will appear here once you upgrade your plan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-6 w-6 animate-spin text-[#EA580C]" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  )
}
