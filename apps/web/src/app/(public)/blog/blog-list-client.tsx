"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, User, ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react"
import { useBlogPosts, type BlogPost } from "@/lib/hooks/use-blog"
import { Button } from "@/components/ui/button"

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").slice(0, 160)
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300"
    >
      {post.coverImageUrl ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-orange-300" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-5">
        <h2 className="text-lg font-semibold font-display text-gray-900 group-hover:text-[#EA580C] transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="mt-2 text-sm text-gray-500 line-clamp-3 flex-1">
          {post.excerpt || stripHtml(post.content)}
        </p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.publishedAt)}
          </div>
          {post.author && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <User className="w-3.5 h-3.5" />
              {post.author.name}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function BlogListClient() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useBlogPosts(page)
  const posts = data?.posts || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 12)

  return (
    <div className="bg-[#FFFBF5] min-h-screen">
      {/* Hero */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-gray-900">
            Our <span className="text-[#EA580C]">Blog</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Insights, tips, and best practices for contract management and renewal tracking.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#EA580C]" />
              <span className="ml-2 text-sm text-gray-500">Loading posts...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-red-600">Failed to load blog posts.</p>
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No blog posts yet. Check back soon!</p>
            </div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-9 px-3"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
