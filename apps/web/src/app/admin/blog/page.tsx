"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  ChevronRight,
  Trash2,
  Pencil,
  Loader2,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminBlogPosts, type BlogPost } from "@/lib/hooks/use-blog"
import { DeleteBlogPostModal } from "./delete-modal"

const statusBadge: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: posts = [], isLoading, error } = useAdminBlogPosts(debouncedSearch || undefined)

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#EBEBEB] bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-400">Admin</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="font-medium text-gray-900">Blog</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-64 h-9 rounded-lg border-[#EBEBEB] bg-[#F8F9FC] text-sm focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>
          <Button
            variant="admin"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/admin/blog/create")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Post</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage blog posts for your website.
          </p>
        </div>

        {/* Mobile search */}
        <div className="flex items-center gap-3 mb-4 sm:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 rounded-lg border-[#EBEBEB] bg-white text-sm focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-[14px] border border-[#EBEBEB] flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
            <span className="ml-2 text-sm text-gray-500">Loading posts...</span>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-white rounded-[14px] border border-red-200 flex items-center justify-center py-20">
            <p className="text-sm text-red-600">Failed to load posts. Please try again.</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <div className="bg-white rounded-[14px] border border-[#EBEBEB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1E1B4B]">
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider hidden md:table-cell">
                      Author
                    </th>
                    <th className="text-left text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider hidden lg:table-cell">
                      Published
                    </th>
                    <th className="text-right text-xs font-medium text-[#A5B4FC] px-6 py-3 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        {debouncedSearch
                          ? "No posts found matching your search."
                          : "No blog posts yet. Create your first post!"}
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">/{post.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                              statusBadge[post.status] || "bg-gray-100 text-gray-700"
                            )}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-sm text-gray-600">{post.author?.name || "—"}</p>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <p className="text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {post.status === "published" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-gray-500 hover:text-[#4F46E5]"
                                onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-gray-500 hover:text-[#4F46E5]"
                              onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-gray-500 hover:text-red-600"
                              onClick={() => setDeletePost(post)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#EBEBEB]">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{posts.length}</span> post{posts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteBlogPostModal
        open={!!deletePost}
        onOpenChange={(open) => !open && setDeletePost(null)}
        post={deletePost}
      />
    </div>
  )
}
