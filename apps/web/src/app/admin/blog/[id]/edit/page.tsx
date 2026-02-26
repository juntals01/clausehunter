"use client"

import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAdminBlogPost } from "@/lib/hooks/use-blog"
import { BlogForm } from "../../blog-form"

export default function EditBlogPostPage() {
  const params = useParams()
  const id = params.id as string
  const { data: post, isLoading, error } = useAdminBlogPost(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
        <span className="ml-2 text-sm text-gray-500">Loading post...</span>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-red-600">Failed to load post. Please try again.</p>
      </div>
    )
  }

  return <BlogForm post={post} />
}
