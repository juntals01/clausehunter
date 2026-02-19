"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  contractId: string | null
  read: boolean
  createdAt: string
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

/** GET /notifications */
export function useNotifications() {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications")
      return data
    },
    refetchInterval: 30_000, // poll every 30s
  })
}

/** PATCH /notifications/:id/read */
export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

/** PATCH /notifications/read-all */
export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
