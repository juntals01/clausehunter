"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

// ─── Types ───────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  coverImageUrl?: string | null
  status: string
  publishedAt: string | null
  authorId: string
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  ogImage: string | null
  canonicalUrl: string | null
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export interface CreateBlogPostPayload {
  title: string
  slug?: string
  excerpt?: string
  content: string
  status?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  ogImage?: string
  canonicalUrl?: string
}

export interface UpdateBlogPostPayload extends Partial<CreateBlogPostPayload> {
  id: string
}

// ─── Admin Hooks ─────────────────────────────────────────────────────

export function useAdminBlogPosts(search?: string) {
  return useQuery<BlogPost[]>({
    queryKey: ["admin-blog-posts", search],
    queryFn: async () => {
      const params = search ? { search } : {}
      const { data } = await api.get("/admin/blog", { params })
      return data
    },
  })
}

export function useAdminBlogPost(id: string | null) {
  return useQuery<BlogPost>({
    queryKey: ["admin-blog-post", id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/blog/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBlogPostPayload) => {
      const { data } = await api.post("/admin/blog", payload)
      return data as BlogPost
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] })
    },
  })
}

export function useUpdateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateBlogPostPayload) => {
      const { data } = await api.patch(`/admin/blog/${id}`, payload)
      return data as BlogPost
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] })
      qc.invalidateQueries({ queryKey: ["admin-blog-post", data.id] })
    },
  })
}

export function useDeleteBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/blog/${id}`)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] })
    },
  })
}

export function useUploadBlogCover() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await api.post(`/admin/blog/${id}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data as BlogPost
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] })
      qc.invalidateQueries({ queryKey: ["admin-blog-post", data.id] })
    },
  })
}

export function useRemoveBlogCover() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/blog/${id}/cover`)
      return data as BlogPost
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] })
      qc.invalidateQueries({ queryKey: ["admin-blog-post", data.id] })
    },
  })
}

// ─── Public Hooks ────────────────────────────────────────────────────

export function useBlogPosts(page: number = 1) {
  return useQuery<{ posts: BlogPost[]; total: number }>({
    queryKey: ["blog-posts", page],
    queryFn: async () => {
      const { data } = await api.get("/blog", { params: { page } })
      return data
    },
  })
}

export function useBlogPost(slug: string | null) {
  return useQuery<BlogPost>({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data } = await api.get(`/blog/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}
