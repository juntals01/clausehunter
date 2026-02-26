"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TiptapEditor } from "@/components/blog/tiptap-editor"
import {
  useCreateBlogPost,
  useUpdateBlogPost,
  useUploadBlogCover,
  useRemoveBlogCover,
  type BlogPost,
  type CreateBlogPostPayload,
} from "@/lib/hooks/use-blog"

interface BlogFormProps {
  post?: BlogPost | null
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 280)
}

export function BlogForm({ post }: BlogFormProps) {
  const router = useRouter()
  const isEditing = !!post

  const [title, setTitle] = useState(post?.title || "")
  const [slug, setSlug] = useState(post?.slug || "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [content, setContent] = useState(post?.content || "")
  const [status, setStatus] = useState<string>(post?.status || "draft")

  // SEO
  const [seoOpen, setSeoOpen] = useState(false)
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "")
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "")
  const [metaKeywords, setMetaKeywords] = useState(post?.metaKeywords || "")
  const [ogImage, setOgImage] = useState(post?.ogImage || "")
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || "")

  // Cover image
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.coverImageUrl || null)

  const createMutation = useCreateBlogPost()
  const updateMutation = useUpdateBlogPost()
  const uploadCoverMutation = useUploadBlogCover()
  const removeCoverMutation = useRemoveBlogCover()

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadCoverMutation.isPending ||
    removeCoverMutation.isPending

  useEffect(() => {
    if (!slugManuallyEdited && !isEditing) {
      setSlug(generateSlug(title))
    }
  }, [title, slugManuallyEdited, isEditing])

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true)
    setSlug(value)
  }, [])

  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }, [])

  const handleRemoveCover = useCallback(async () => {
    if (isEditing && post?.coverImage) {
      await removeCoverMutation.mutateAsync(post.id)
    }
    setCoverFile(null)
    setCoverPreview(null)
  }, [isEditing, post, removeCoverMutation])

  const handleSave = async (saveStatus: string) => {
    const payload: CreateBlogPostPayload = {
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      status: saveStatus,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      metaKeywords: metaKeywords || undefined,
      ogImage: ogImage || undefined,
      canonicalUrl: canonicalUrl || undefined,
    }

    try {
      let savedPost: BlogPost

      if (isEditing) {
        savedPost = await updateMutation.mutateAsync({ id: post!.id, ...payload })
      } else {
        savedPost = await createMutation.mutateAsync(payload)
      }

      if (coverFile) {
        await uploadCoverMutation.mutateAsync({ id: savedPost.id, file: coverFile })
      }

      router.push("/admin/blog")
    } catch (err) {
      // error handled by mutation
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-[#EBEBEB] bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-500"
            onClick={() => router.push("/admin/blog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold font-display text-gray-900">
            {isEditing ? "Edit Post" : "New Post"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            disabled={isPending || !title.trim() || !content.trim()}
          >
            {isPending && status === "draft" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save Draft
          </Button>
          <Button
            variant="admin"
            size="sm"
            onClick={() => handleSave("published")}
            disabled={isPending || !title.trim() || !content.trim()}
          >
            {isPending && status === "published" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isEditing && post?.status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="mt-1.5 h-11 text-lg font-display"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
              Slug
            </Label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-gray-400">/blog/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="post-url-slug"
                className="h-9"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Cover Image</Label>
            <div className="mt-1.5">
              {coverPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#4F46E5]/40 hover:bg-[#4F46E5]/5 transition-colors">
                  <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-500">
                    Click to upload cover image
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post (shown in blog listing)..."
              className="mt-1.5 h-20 resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Content</Label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your blog post content here..."
            />
          </div>

          {/* SEO Settings */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">SEO Settings</span>
              {seoOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {seoOpen && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div>
                  <Label htmlFor="metaTitle" className="text-sm font-medium text-gray-700">
                    Meta Title
                  </Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title (defaults to post title)"
                    className="mt-1.5"
                    maxLength={255}
                  />
                  <p className="text-xs text-gray-400 mt-1">{metaTitle.length}/255</p>
                </div>
                <div>
                  <Label htmlFor="metaDescription" className="text-sm font-medium text-gray-700">
                    Meta Description
                  </Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description (defaults to excerpt)"
                    className="mt-1.5 h-20 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/500</p>
                </div>
                <div>
                  <Label htmlFor="metaKeywords" className="text-sm font-medium text-gray-700">
                    Meta Keywords
                  </Label>
                  <Input
                    id="metaKeywords"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="comma, separated, keywords"
                    className="mt-1.5"
                    maxLength={500}
                  />
                </div>
                <div>
                  <Label htmlFor="ogImage" className="text-sm font-medium text-gray-700">
                    OG Image URL
                  </Label>
                  <Input
                    id="ogImage"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://... (defaults to cover image)"
                    className="mt-1.5"
                    maxLength={500}
                  />
                </div>
                <div>
                  <Label htmlFor="canonicalUrl" className="text-sm font-medium text-gray-700">
                    Canonical URL
                  </Label>
                  <Input
                    id="canonicalUrl"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://... (leave empty to use default)"
                    className="mt-1.5"
                    maxLength={500}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error display */}
          {(createMutation.error || updateMutation.error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {(createMutation.error as any)?.response?.data?.message ||
                  (updateMutation.error as any)?.response?.data?.message ||
                  "Failed to save post. Please try again."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
