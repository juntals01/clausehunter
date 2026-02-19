"use client"

import { useMutation } from "@tanstack/react-query"
import api from "../api"
import { useAuth } from "../auth-context"

export interface UpdateProfilePayload {
  name?: string
  company?: string
  currentPassword?: string
  newPassword?: string
}

/** PATCH /auth/profile */
export function useUpdateProfile() {
  const { refreshUser } = useAuth()

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.patch("/auth/profile", payload)
      return data
    },
    onSuccess: () => {
      refreshUser()
    },
  })
}
