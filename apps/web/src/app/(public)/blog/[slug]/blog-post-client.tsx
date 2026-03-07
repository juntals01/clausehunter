"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Share2,
  BookOpen,
} from "lucide-react"
import type { BlogPost } from "@/lib/hooks/use-blog"

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "")
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

const SLUG_COVERS: Record<string, string> = {
  "hidden-cost-missed-contract-renewals": "/blog-cover-hidden-cost-missed-renewals.png",
  "healthcare-documents-must-track": "/blog-cover-healthcare-documents.png",
  "how-ai-document-extraction-works": "/blog-cover-ai-extraction.png",
  "contract-auto-renewal-clauses-guide": "/blog-cover-auto-renewal-clauses.png",
  "ssl-certificate-expiration-prevention": "/blog-cover-ssl-expiration.png",
  "hipaa-compliance-document-management-guide": "/blog-cover-hipaa-compliance.png",
}

export function BlogPostClient({ post }: { post: BlogPost }) {
  const readTime = estimateReadTime(post.content)
  const coverSrc = post.coverImageUrl || SLUG_COVERS[post.slug] || null

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="bg-[#FFFBF5] min-h-screen">
      {/* Top navigation bar */}
      <div className="sticky top-16 z-10 bg-[#FFFBF5]/90 backdrop-blur-md border-b border-orange-100/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#78716C] hover:text-[#EA580C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#78716C] hover:text-[#EA580C] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16 sm:pb-24">
        {/* Cover image */}
        {coverSrc && (
          <div className="rounded-2xl overflow-hidden mb-10 border border-orange-100 shadow-sm">
            <img
              src={coverSrc}
              alt={post.title}
              className="w-full aspect-[2/1] object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-10">
          {post.excerpt && (
            <p className="text-xs font-semibold uppercase tracking-[2px] text-[#EA580C] mb-4">
              Article
            </p>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-display text-[#1C1917] leading-[1.15] tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 text-lg sm:text-xl text-[#78716C] leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5 mt-6 pt-6 border-t border-orange-100/60">
            {post.author && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EA580C] to-[#F97316] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C1917]">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-[#A8A29E]">Author</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-[#A8A29E]">
              <span className="hidden sm:block w-px h-6 bg-orange-100" />
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="
            prose prose-lg max-w-none

            prose-headings:font-display
            prose-headings:text-[#1C1917]
            prose-headings:tracking-tight

            prose-h2:text-2xl
            prose-h2:sm:text-[28px]
            prose-h2:mt-12
            prose-h2:mb-4
            prose-h2:font-bold
            prose-h2:border-b
            prose-h2:border-orange-100/60
            prose-h2:pb-3

            prose-h3:text-xl
            prose-h3:mt-8
            prose-h3:mb-3
            prose-h3:font-semibold

            prose-p:text-[#44403C]
            prose-p:leading-[1.8]
            prose-p:text-base
            prose-p:sm:text-[17px]

            prose-li:text-[#44403C]
            prose-li:leading-[1.8]
            prose-li:text-base
            prose-li:sm:text-[17px]
            prose-li:marker:text-[#EA580C]

            prose-ul:my-4
            prose-ol:my-4

            prose-a:text-[#EA580C]
            prose-a:font-medium
            prose-a:underline
            prose-a:underline-offset-2
            prose-a:decoration-orange-200
            hover:prose-a:decoration-[#EA580C]
            prose-a:transition-colors

            prose-strong:text-[#1C1917]
            prose-strong:font-semibold

            prose-blockquote:border-l-[3px]
            prose-blockquote:border-[#EA580C]
            prose-blockquote:bg-[#FFF7ED]
            prose-blockquote:rounded-r-xl
            prose-blockquote:py-3
            prose-blockquote:px-5
            prose-blockquote:not-italic
            prose-blockquote:text-[#57534E]

            prose-code:text-[#EA580C]
            prose-code:bg-orange-50
            prose-code:px-1.5
            prose-code:py-0.5
            prose-code:rounded-md
            prose-code:text-sm
            prose-code:font-medium
            prose-code:before:content-none
            prose-code:after:content-none

            prose-img:rounded-xl
            prose-img:border
            prose-img:border-orange-100
            prose-img:shadow-sm

            prose-hr:border-orange-100
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Card */}
        <div className="mt-14 rounded-2xl border border-orange-200 bg-gradient-to-br from-[#FFF7ED] to-[#FFFBF5] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-xl bg-[#EA580C] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-[#1C1917] mb-1">
                Never miss a deadline again
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                Upload your contracts and documents. AI extracts every deadline, notice period, and renewal clause — then alerts you before they pass.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#EA580C] text-white font-display font-semibold text-sm rounded-[10px] py-3 px-6 hover:bg-[#DC5409] transition-colors shadow-lg shadow-orange-200/50 whitespace-nowrap"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-orange-100/60 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#78716C] hover:text-[#EA580C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#78716C] hover:text-[#EA580C] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share this article
          </button>
        </div>
      </article>
    </div>
  )
}
