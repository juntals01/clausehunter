"use client"

import {
  Search,
  Upload,
  Bell,
  CreditCard,
  FileText,
  Zap,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

const invoices = [
  { date: "Feb 01, 2026", amount: "$19.00", status: "Paid", id: "INV-2026-002" },
  { date: "Jan 01, 2026", amount: "$19.00", status: "Paid", id: "INV-2026-001" },
  { date: "Dec 01, 2025", amount: "$19.00", status: "Paid", id: "INV-2025-012" },
]

export default function BillingPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#E7E5E4]">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search contracts..."
            className="w-full rounded-lg border border-[#E7E5E4] bg-white py-2 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
          />
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload contract
          </a>
          <button className="relative rounded-lg p-2 text-[#78716C] hover:bg-white hover:text-[#1C1917] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EA580C]" />
          </button>
          <div className="h-8 w-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-sm font-medium">
            JD
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pb-8 pt-6 space-y-6">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">Billing</h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Manage your subscription and payments
          </p>

          {/* Current Plan */}
          <div className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <Zap className="h-6 w-6 text-[#EA580C]" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-[#1C1917]">
                    Pro Plan
                  </h2>
                  <p className="text-sm text-[#78716C]">$19/month</p>
                  <p className="mt-1 text-xs text-[#78716C]">
                    Renews on Mar 01, 2026
                  </p>
                </div>
              </div>
              <button className="rounded-lg border border-[#E7E5E4] px-4 py-2 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors">
                Change Plan
              </button>
            </div>
          </div>

          {/* Usage */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
              Usage
            </h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#78716C]">Contracts used</span>
              <span className="text-sm font-medium text-[#1C1917]">12 / 50</span>
            </div>
            <div className="h-2 rounded-full bg-[#E7E5E4] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#EA580C]"
                style={{ width: "24%" }}
              />
            </div>
            <p className="mt-2 text-xs text-[#78716C]">38 contracts remaining</p>
          </div>

          {/* Payment Method */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAFAF9] border border-[#E7E5E4]">
                  <CreditCard className="h-5 w-5 text-[#78716C]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1917]">
                    Visa ending in 4242
                  </p>
                  <p className="text-xs text-[#78716C]">Expires 12/2027</p>
                </div>
              </div>
              <button className="text-sm font-medium text-[#EA580C] hover:underline">
                Update
              </button>
            </div>
          </div>

          {/* Billing History */}
          <div className="mt-6 rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E7E5E4]">
              <h2 className="font-display text-base font-semibold text-[#1C1917]">
                Billing History
              </h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#78716C]">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#1C1917]">{inv.date}</td>
                    <td className="px-6 py-4 text-sm text-[#78716C]">{inv.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#1C1917]">
                      {inv.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#78716C] hover:text-[#1C1917] transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
