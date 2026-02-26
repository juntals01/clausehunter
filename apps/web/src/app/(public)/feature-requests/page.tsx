"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronUp, Plus, Loader2, MessageSquare, Lightbulb, CheckCircle2, Clock, Rocket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useFeatureRequests,
  useCreateFeatureRequest,
  useToggleVote,
  type FeatureRequestItem,
} from "@/lib/hooks/use-feature-requests"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const featureRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must be under 255 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
})

type FeatureRequestValues = z.infer<typeof featureRequestSchema>

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: MessageSquare },
  planned: { label: "Planned", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Clock },
  in_progress: { label: "In Progress", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Rocket },
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: CheckCircle2 },
  closed: { label: "Closed", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: X },
}

type FilterStatus = "all" | "open" | "planned" | "in_progress" | "completed"

export default function FeatureRequestsPage() {
  return (
    <Suspense>
      <FeatureRequestsContent />
    </Suspense>
  )
}

function FeatureRequestsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { data: requests = [], isLoading } = useFeatureRequests()
  const createMutation = useCreateFeatureRequest()
  const voteMutation = useToggleVote()

  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeatureRequestValues>({
    resolver: zodResolver(featureRequestSchema),
  })

  useEffect(() => {
    if (searchParams.get("create") === "true" && user) {
      setShowForm(true)
      window.history.replaceState(null, "", "/feature-requests")
    }
  }, [searchParams, user])

  const filtered = requests
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => {
      if (sortBy === "votes") return b.voteCount - a.voteCount
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const onSubmit = async (values: FeatureRequestValues) => {
    await createMutation.mutateAsync({ title: values.title.trim(), description: values.description.trim() })
    reset()
    setShowForm(false)
  }

  const handleNewRequest = () => {
    if (!user) {
      router.push(`/sign-in?redirect=${encodeURIComponent("/feature-requests?create=true")}`)
      return
    }
    setShowForm(!showForm)
  }

  const handleVote = (id: string) => {
    if (!user) {
      router.push("/sign-in?redirect=/feature-requests")
      return
    }
    voteMutation.mutate(id)
  }

  const statusCounts = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 lg:px-[120px] py-12 lg:py-20 border-b border-[#E7E5E4]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-[#EA580C]" />
            <p className="text-sm font-semibold text-[#EA580C]">Feature Requests</p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-[#1C1917] mb-4">
            Help shape what we build next
          </h1>
          <p className="text-[#78716C] text-base lg:text-lg leading-relaxed">
            Vote on existing ideas or submit your own. The most popular requests get prioritized in our roadmap.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 sm:px-8 lg:px-[120px] py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "open", "planned", "in_progress", "completed"] as FilterStatus[]).map((status) => {
                const count = status === "all" ? requests.length : statusCounts[status] || 0
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      filter === status
                        ? "bg-[#EA580C] text-white border-[#EA580C]"
                        : "bg-white text-[#78716C] border-[#E7E5E4] hover:border-[#D6D3D1]",
                    )}
                  >
                    {status === "all" ? "All" : STATUS_CONFIG[status]?.label ?? status} ({count})
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "votes" | "newest")}
                className="text-xs border border-[#E7E5E4] rounded-lg px-3 py-1.5 bg-white text-[#57534E] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
              >
                <option value="votes">Most Voted</option>
                <option value="newest">Newest</option>
              </select>
              <Button
                onClick={handleNewRequest}
                className="bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-lg text-xs h-8 px-4"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Request
              </Button>
            </div>
          </div>

          {/* New Request Form */}
          {showForm && (
            <div className="mb-8 p-6 rounded-2xl border border-[#FFEDD5] bg-[#FFF7ED]">
              <h3 className="font-display text-base font-semibold text-[#1C1917] mb-4">
                Submit a Feature Request
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fr-title" className="text-sm text-[#57534E]">
                    Title
                  </Label>
                  <Input
                    id="fr-title"
                    placeholder="Short, descriptive title for your idea"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600">{errors.title.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fr-desc" className="text-sm text-[#57534E]">
                    Description
                  </Label>
                  <textarea
                    id="fr-desc"
                    rows={4}
                    placeholder="Describe the feature in detail. What problem does it solve? How would it work?"
                    {...register("description")}
                    className="flex w-full rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm placeholder:text-[#A8A29E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/20 focus-visible:border-[#EA580C] transition-colors resize-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-lg text-sm h-9 px-5"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="text-[#78716C] text-sm h-9"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#EA580C]" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF7ED] mb-4">
                <Lightbulb className="w-7 h-7 text-[#EA580C]" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#1C1917] mb-2">
                No feature requests yet
              </h3>
              <p className="text-[#78716C] text-sm max-w-sm">
                Be the first to suggest a feature! Your ideas help us build a better product.
              </p>
            </div>
          )}

          {/* Feature Request List */}
          <div className="flex flex-col gap-3">
            {filtered.map((request) => (
              <FeatureRequestCard
                key={request.id}
                request={request}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureRequestCard({
  request,
  onVote,
  isVoting,
  isLoggedIn,
}: {
  request: FeatureRequestItem
  onVote: (id: string) => void
  isVoting: boolean
  isLoggedIn: boolean
}) {
  const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.open
  const StatusIcon = config.icon

  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#D6D3D1] transition-colors">
      {/* Vote Button */}
      <button
        onClick={() => onVote(request.id)}
        disabled={isVoting}
        title={request.hasVoted ? "Remove vote" : "Upvote"}
        className={cn(
          "flex flex-col items-center justify-center w-14 h-16 rounded-xl border shrink-0 transition-all",
          request.hasVoted
            ? "bg-[#EA580C] border-[#EA580C] text-white"
            : "bg-[#FAFAF9] border-[#E7E5E4] text-[#78716C] hover:border-[#EA580C] hover:text-[#EA580C]",
          isVoting && "opacity-60 cursor-not-allowed",
        )}
      >
        <ChevronUp className="w-4 h-4" />
        <span className="text-sm font-semibold">{request.voteCount}</span>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="font-display text-[15px] font-semibold text-[#1C1917] leading-snug">
            {request.title}
          </h3>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0",
              config.bg,
              config.color,
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </span>
        </div>
        <p className="text-sm text-[#57534E] leading-relaxed line-clamp-2 mb-2">
          {request.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-[#A8A29E]">
          <span>
            by{" "}
            <span className="text-[#78716C] font-medium">
              {request.user?.name || "Anonymous"}
            </span>
          </span>
          <span>&middot;</span>
          <span>{new Date(request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        {request.adminResponse && (
          <div className="mt-3 p-3 rounded-lg bg-[#F5F3FF] border border-[#E0E7FF]">
            <p className="text-xs font-semibold text-[#4F46E5] mb-1">Admin Response</p>
            <p className="text-sm text-[#57534E] leading-relaxed">{request.adminResponse}</p>
          </div>
        )}
      </div>
    </div>
  )
}
