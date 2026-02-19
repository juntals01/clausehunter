"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

// ─── Types ───────────────────────────────────────────────────────────
export interface ContractExtractionData {
  vendor_name: string | null
  contract_end_date: string | null
  notice_period_days: number | null
  auto_renews: boolean | null
  renewal_term_months: number | null
  cancellation_deadline: string | null
  renewal_clauses: { clause_text: string; source_text: string }[]
  penalty_clauses: { clause_text: string; source_text: string }[]
  key_dates: { date: string; label: string; source_text: string }[]
  summary: string | null
}

export interface Contract {
  id: string
  userId: string | null
  originalFilename: string
  vendor: string | null
  endDate: string | null
  noticeDays: number | null
  autoRenews: boolean | null
  status: string
  errorMessage: string | null
  extractionData: ContractExtractionData | null
  createdAt: string
  updatedAt: string
}

export interface DashboardContract {
  id: string
  vendor: string | null
  endDate: string | null
  noticeDays: number | null
  autoRenews: boolean | null
  status: string
  daysLeftToCancel: number | null
  urgencyStatus: "safe" | "approaching" | "in-window" | "needs-review"
}

// ─── Hooks ───────────────────────────────────────────────────────────

/** GET /contracts - list user contracts (dashboard format) */
export function useContracts() {
  return useQuery<DashboardContract[]>({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data } = await api.get("/contracts")
      return data
    },
  })
}

/** GET /contracts/:id – auto-polls while processing/queued */
export function useContract(id: string) {
  return useQuery<Contract>({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const { data } = await api.get(`/contracts/${id}`)
      return data
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "processing" || status === "queued") return 5000
      return false
    },
  })
}

/** POST /contracts/upload */
export function useUploadContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await api.post("/contracts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data as Contract
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] })
    },
  })
}

/** PATCH /contracts/:id */
export function useUpdateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      vendor?: string
      endDate?: string
      noticeDays?: number
      autoRenews?: boolean
    }) => {
      const { data: res } = await api.patch(`/contracts/${id}`, data)
      return res as Contract
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["contracts"] })
      qc.invalidateQueries({ queryKey: ["contracts", vars.id] })
    },
  })
}

/** POST /contracts/:id/reprocess */
export function useReprocessContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/contracts/${id}/reprocess`)
      return data as Contract
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["contracts"] })
      qc.invalidateQueries({ queryKey: ["contracts", id] })
    },
  })
}

/** DELETE /contracts/:id */
export function useDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contracts/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] })
    },
  })
}
