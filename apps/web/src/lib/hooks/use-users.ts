"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api"

// ─── Types ───────────────────────────────────────────────────────────
export interface ApiUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  company: string | null
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role?: string
  status?: string
  company?: string
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  role?: string
  status?: string
  company?: string
}

// ─── Hooks ───────────────────────────────────────────────────────────

/** GET /users (admin) */
export function useUsers(search?: string) {
  return useQuery<ApiUser[]>({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const params = search ? { search } : {}
      const { data } = await api.get("/users", { params })
      return data
    },
  })
}

/** GET /users/:id (admin) */
export function useUser(id: string) {
  return useQuery<ApiUser>({
    queryKey: ["admin-users", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`)
      return data
    },
    enabled: !!id,
  })
}

/** POST /users (admin) */
export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const { data } = await api.post("/users", payload)
      return data as ApiUser
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

/** PATCH /users/:id (admin) */
export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateUserPayload & { id: string }) => {
      const { data } = await api.patch(`/users/${id}`, payload)
      return data as ApiUser
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
      qc.invalidateQueries({ queryKey: ["admin-users", vars.id] })
    },
  })
}

/** DELETE /users/:id (admin) */
export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })
}

/** GET /users/count (admin) */
export function useUserCount() {
  return useQuery<number>({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { data } = await api.get("/users/count")
      return data
    },
  })
}
