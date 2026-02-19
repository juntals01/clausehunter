"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Search,
  Upload,
  ChevronDown,
  HelpCircle,
  Send,
  Loader2,
  Check,
  AlertCircle,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle as QuestionIcon,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useFeedback, useCreateFeedback, type FeedbackItem } from "@/lib/hooks/use-feedback"

const feedbackSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  category: z.enum(["bug", "feature", "question", "other"]),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

const faqs = [
  {
    question: "How does ExpirationReminderAI work?",
    answer:
      "ExpirationReminderAI uses AI to analyze your uploaded contracts. It automatically extracts key details like vendor names, contract end dates, notice periods, and auto-renewal clauses. You'll get alerts before deadlines so you never miss a cancellation window.",
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

const categories = [
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "feature", label: "Feature Request", icon: Lightbulb },
  { value: "question", label: "Question", icon: QuestionIcon },
  { value: "other", label: "Other", icon: MoreHorizontal },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-600" },
  resolved: { label: "Resolved", className: "bg-green-50 text-green-600" },
  closed: { label: "Closed", className: "bg-red-50 text-red-500" },
}

const categoryConfig: Record<string, { label: string; className: string }> = {
  bug: { label: "Bug", className: "bg-red-50 text-red-600" },
  feature: { label: "Feature", className: "bg-purple-50 text-purple-600" },
  question: { label: "Question", className: "bg-blue-50 text-blue-600" },
  other: { label: "Other", className: "bg-gray-100 text-gray-600" },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function TicketCard({ ticket }: { ticket: FeedbackItem }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[ticket.status] ?? statusConfig.open
  const category = categoryConfig[ticket.category] ?? categoryConfig.other

  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#FAFAF9] transition-colors"
      >
        <div className="flex flex-col gap-1.5 min-w-0 flex-1 mr-4">
          <span className="text-sm font-medium text-[#1C1917] truncate">
            {ticket.title}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", category.className)}>
              {category.label}
            </span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", status.className)}>
              {status.label}
            </span>
            <span className="text-[11px] text-[#A8A29E]">{formatDate(ticket.createdAt)}</span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-[#78716C] transition-transform shrink-0", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-[#E7E5E4]">
          <p className="text-sm text-[#78716C] leading-relaxed pt-3">
            {ticket.description}
          </p>
          {ticket.adminNote && (
            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3">
              <p className="text-[11px] font-medium text-blue-700 mb-1">Admin Response</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                {ticket.adminNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: tickets, isLoading: ticketsLoading } = useFeedback()
  const createFeedback = useCreateFeedback()

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { title: "", description: "", category: "other" },
  })

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  const resetForm = () => {
    form.reset()
    setSubmitError(null)
  }

  const onSubmit = async (values: FeedbackFormValues) => {
    setSubmitError(null)
    try {
      await createFeedback.mutateAsync(values)
      resetForm()
      setShowForm(false)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || "Failed to submit ticket. Please try again."
      setSubmitError(message)
    }
  }

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
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            Help & Support
          </h1>
          <p className="mt-1 text-sm text-[#78716C]">
            Find answers or submit feedback to our team
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

          {/* Submit Feedback */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-[#1C1917]">
                Submit Feedback
              </h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  New Ticket
                </button>
              )}
            </div>

            {submitted && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 mb-4">
                <Check className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700">Feedback submitted successfully! We&apos;ll review it shortly.</p>
              </div>
            )}

            {showForm && (
              <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-[#E7E5E4] bg-white p-5 space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-2">
                    Category
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      const selected = form.watch("category") === cat.value
                      return (
                        <button
                          type="button"
                          key={cat.value}
                          onClick={() => form.setValue("category", cat.value as FeedbackFormValues["category"])}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border",
                            selected
                              ? "bg-[#EA580C] text-white border-[#EA580C]"
                              : "bg-white text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917]"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {cat.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    {...form.register("title")}
                    placeholder="Brief summary of your issue or suggestion"
                    className={cn(
                      "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-1",
                      form.formState.errors.title
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                        : "border-[#E7E5E4] focus:border-[#EA580C] focus:ring-[#EA580C]"
                    )}
                  />
                  {form.formState.errors.title && (
                    <p className="mt-1.5 text-xs text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    Description
                  </label>
                  <textarea
                    {...form.register("description")}
                    placeholder="Describe the issue or suggestion in detail..."
                    rows={4}
                    className={cn(
                      "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-1 resize-none",
                      form.formState.errors.description
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                        : "border-[#E7E5E4] focus:border-[#EA580C] focus:ring-[#EA580C]"
                    )}
                  />
                  {form.formState.errors.description && (
                    <p className="mt-1.5 text-xs text-red-600">{form.formState.errors.description.message}</p>
                  )}
                </div>

                {/* API Error */}
                {submitError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={createFeedback.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#DC4A04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createFeedback.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="rounded-lg border border-[#E7E5E4] px-4 py-2.5 text-sm font-medium text-[#78716C] hover:bg-[#FAFAF9] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* My Tickets */}
          <div className="mt-8">
            <h2 className="font-display text-base font-semibold text-[#1C1917] mb-4">
              My Tickets
            </h2>

            {ticketsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#EA580C]" />
              </div>
            ) : !tickets || tickets.length === 0 ? (
              <div className="rounded-2xl border border-[#E7E5E4] bg-white px-6 py-8 text-center">
                <MessageSquare className="h-10 w-10 text-[#D6D3D1] mx-auto mb-3" />
                <p className="text-sm text-[#78716C]">No tickets yet</p>
                <p className="text-xs text-[#A8A29E] mt-1">
                  Submit feedback and your tickets will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
