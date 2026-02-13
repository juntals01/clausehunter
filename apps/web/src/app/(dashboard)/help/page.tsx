"use client"

import { useState } from "react"
import {
  Search,
  Upload,
  Bell,
  ChevronDown,
  MessageCircle,
  Mail,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How does ClauseHunter work?",
    answer:
      "ClauseHunter uses AI to analyze your uploaded contracts. It automatically extracts key details like vendor names, contract end dates, notice periods, and auto-renewal clauses. You'll get alerts before deadlines so you never miss a cancellation window.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We currently support PDF and Word (DOCX) files. Our AI-powered OCR can handle scanned documents as well as native digital PDFs. We recommend uploading clear, legible copies for the best extraction accuracy.",
  },
  {
    question: "How accurate is the AI clause extraction?",
    answer:
      "Our AI achieves 95%+ accuracy on most contracts. After extraction, you can always review and edit the detected clauses and dates. The system improves over time as it processes more documents.",
  },
  {
    question: "How do notifications and reminders work?",
    answer:
      "You can configure email notifications in Settings. Choose to be reminded 7, 14, or 30 days before a contract's cancel-by date. We'll send you an email alert so you have time to act before auto-renewal kicks in.",
  },
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

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
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Help & Support
          </h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Find answers or reach out to our team
          </p>

          {/* Search */}
          <div className="relative mt-6">
            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#78716C]" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full rounded-2xl border border-[#E7E5E4] bg-white py-3 pl-12 pr-4 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>

          {/* FAQ Accordion */}
          <div className="mt-8 space-y-3">
            <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-[#1C1917]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[#78716C] transition-transform",
                      openIndex === i && "rotate-180"
                    )}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-[#78716C] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-8 rounded-2xl border border-[#E7E5E4] bg-white p-6">
            <h2 className="font-display text-base font-semibold text-[#1C1917] mb-2">
              Still need help?
            </h2>
            <p className="text-sm text-[#78716C] mb-4">
              Our support team is here to help you with any questions.
            </p>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors">
                <MessageCircle className="h-4 w-4" />
                Start Chat
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#1C1917] hover:bg-[#FAFAF9] transition-colors">
                <Mail className="h-4 w-4 text-[#78716C]" />
                Email Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
