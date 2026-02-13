"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

export interface AdminContract {
  id: string
  userId: string | null
  originalFilename: string
  vendor: string | null
  endDate: string | null
  noticeDays: number | null
  autoRenews: boolean | null
  status: string
  errorMessage: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  } | null
}

/** GET /admin/contracts */
export function useAdminContracts() {
  return useQuery<AdminContract[]>({
    queryKey: ["admin-contracts"],
    queryFn: async () => {
      const { data } = await api.get("/admin/contracts")
      return data
    },
  })
}

/** DELETE /admin/contracts/:id */
export function useAdminDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/contracts/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contracts"] })
    },
  })
}
