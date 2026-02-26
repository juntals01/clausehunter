"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

export interface FeatureRequestItem {
  id: string
  title: string
  description: string
  status: string
  voteCount: number
  userId: string
  adminResponse: string | null
  createdAt: string
  updatedAt: string
  hasVoted?: boolean
  user?: {
    id: string
    name: string
    avatar: string | null
  }
}

export interface CreateFeatureRequestPayload {
  title: string
  description: string
}

export interface UpdateFeatureRequestPayload {
  status?: string
  adminResponse?: string
}

export function useFeatureRequests() {
  return useQuery<FeatureRequestItem[]>({
    queryKey: ["feature-requests"],
    queryFn: async () => {
      const { data } = await api.get("/feature-requests")
      return data
    },
  })
}

export function useFeatureRequest(id: string) {
  return useQuery<FeatureRequestItem>({
    queryKey: ["feature-requests", id],
    queryFn: async () => {
      const { data } = await api.get(`/feature-requests/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateFeatureRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateFeatureRequestPayload) => {
      const { data } = await api.post("/feature-requests", payload)
      return data as FeatureRequestItem
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] })
    },
  })
}

export function useToggleVote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/feature-requests/${id}/vote`)
      return data as { voted: boolean; voteCount: number }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] })
    },
  })
}

export function useUpdateFeatureRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateFeatureRequestPayload & { id: string }) => {
      const { data } = await api.patch(`/admin/feature-requests/${id}`, payload)
      return data as FeatureRequestItem
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] })
    },
  })
}

export function useDeleteFeatureRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/feature-requests/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] })
    },
  })
}
