"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

export interface ContractItem {
  id: string
  contractId: string
  name: string
  description: string | null
  expiryDate: string | null
  noticeDays: number | null
  status: string
  sourceText: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateContractItemInput {
  name: string
  description?: string
  expiryDate?: string
  noticeDays?: number
  sourceText?: string
}

export interface UpdateContractItemInput {
  name?: string
  description?: string
  expiryDate?: string
  noticeDays?: number
  status?: string
  sourceText?: string
}

/** GET /contracts/:contractId/items */
export function useContractItems(contractId: string) {
  return useQuery<ContractItem[]>({
    queryKey: ["contract-items", contractId],
    queryFn: async () => {
      const { data } = await api.get(`/contracts/${contractId}/items`)
      return data
    },
    enabled: !!contractId,
  })
}

/** POST /contracts/:contractId/items */
export function useCreateContractItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      contractId,
      ...input
    }: CreateContractItemInput & { contractId: string }) => {
      const { data } = await api.post(`/contracts/${contractId}/items`, input)
      return data as ContractItem
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["contract-items", vars.contractId] })
    },
  })
}

/** PATCH /contracts/:contractId/items/:itemId */
export function useUpdateContractItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      contractId,
      itemId,
      ...input
    }: UpdateContractItemInput & { contractId: string; itemId: string }) => {
      const { data } = await api.patch(
        `/contracts/${contractId}/items/${itemId}`,
        input
      )
      return data as ContractItem
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["contract-items", vars.contractId] })
    },
  })
}

/** DELETE /contracts/:contractId/items/:itemId */
export function useDeleteContractItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      contractId,
      itemId,
    }: {
      contractId: string
      itemId: string
    }) => {
      await api.delete(`/contracts/${contractId}/items/${itemId}`)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["contract-items", vars.contractId] })
    },
  })
}
