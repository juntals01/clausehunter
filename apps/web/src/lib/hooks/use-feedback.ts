"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

// ─── Types ───────────────────────────────────────────────────────────
export interface FeedbackItem {
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
}

export interface CreateFeedbackPayload {
  title: string
  description: string
  category?: string
  priority?: string
}

// ─── Hooks ───────────────────────────────────────────────────────────

/** GET /feedback - list current user's tickets */
export function useFeedback() {
  return useQuery<FeedbackItem[]>({
    queryKey: ["feedback"],
    queryFn: async () => {
      const { data } = await api.get("/feedback")
      return data
    },
  })
}

/** POST /feedback - create a new ticket */
export function useCreateFeedback() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateFeedbackPayload) => {
      const { data } = await api.post("/feedback", payload)
      return data as FeedbackItem
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedback"] })
    },
  })
}
