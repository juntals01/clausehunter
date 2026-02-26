"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, User, Clock } from "lucide-react"
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

export function BlogPostClient({ post }: { post: BlogPost }) {
  const readTime = estimateReadTime(post.content)

  return (
    <div className="bg-[#FFFBF5] min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[#EA580C] hover:text-[#C2410C] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-orange-100">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full aspect-[2/1] object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
            {post.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{readTime} min read</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-display prose-headings:text-gray-900
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-[#EA580C] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-blockquote:border-[#EA580C] prose-blockquote:bg-orange-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
            prose-code:text-[#EA580C] prose-code:bg-orange-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-img:rounded-xl prose-img:border prose-img:border-orange-100"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-orange-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#EA580C] hover:text-[#C2410C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        </div>
      </article>
    </div>
  )
}
