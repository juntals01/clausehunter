"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

// ─── Types ───────────────────────────────────────────────────────────
export interface AdminFeedbackItem {
  id: string
  userId: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  adminNote: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export interface UpdateFeedbackStatusPayload {
  id: string
  status?: string
  adminNote?: string
}

// ─── Hooks ───────────────────────────────────────────────────────────

/** GET /admin/feedback - all tickets with user info */
export function useAdminFeedback() {
  return useQuery<AdminFeedbackItem[]>({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data } = await api.get("/admin/feedback")
      return data
    },
  })
}

/** PATCH /admin/feedback/:id - update status/adminNote */
export function useUpdateFeedbackStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateFeedbackStatusPayload) => {
      const { data } = await api.patch(`/admin/feedback/${id}`, payload)
      return data as AdminFeedbackItem
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-feedback"] })
    },
  })
}
