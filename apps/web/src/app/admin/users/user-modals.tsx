"use client"

import { useState, useEffect } from "react"
import { TriangleAlert, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type ApiUser,
} from "@/lib/hooks/use-users"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function capitalize(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response
    if (res?.data?.message) return res.data.message
  }
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

/* ------------------------------------------------------------------ */
/*  Schemas                                                            */
/* ------------------------------------------------------------------ */

const addUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
})

type AddUserValues = z.infer<typeof addUserSchema>

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
})

type EditUserValues = z.infer<typeof editUserSchema>

/* ------------------------------------------------------------------ */
/*  Badge maps                                                         */
/* ------------------------------------------------------------------ */

const roleBadge: Record<string, string> = {
  Admin: "bg-blue-100 text-blue-700",
  User: "bg-gray-100 text-gray-700",
  Editor: "bg-purple-100 text-purple-700",
}

const statusBadge: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-500",
}

/* ------------------------------------------------------------------ */
/*  AddUserModal                                                       */
/* ------------------------------------------------------------------ */

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const createUser = useCreateUser()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddUserValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      status: "active",
    },
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      reset()
      setApiError(null)
    }
  }, [open, reset])

  const onSubmit = async (values: AddUserValues) => {
    setApiError(null)
    try {
      await createUser.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        status: values.status,
      })
      onOpenChange(false)
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. They will receive an invitation email.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-2" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="add-name">Full Name</Label>
            <Input
              id="add-name"
              placeholder="e.g. Jane Doe"
              className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="jane@example.com"
              className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-password">Password</Label>
            <Input
              id="add-password"
              type="password"
              placeholder="Min. 6 characters"
              className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#EBEBEB]"
              disabled={createUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="admin" disabled={createUser.isPending}>
              {createUser.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  UserDetailModal                                                    */
/* ------------------------------------------------------------------ */

interface UserDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ApiUser | null
}

export function UserDetailModal({ open, onOpenChange, user }: UserDetailModalProps) {
  if (!user) return null

  const displayRole = capitalize(user.role)
  const displayStatus = capitalize(user.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Viewing detailed information for this user account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-xl font-bold font-display">
            {getInitials(user.name)}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold font-display text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-[#F8F9FC] rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Role</p>
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                roleBadge[displayRole] || "bg-gray-100 text-gray-700"
              )}
            >
              {displayRole}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                statusBadge[displayStatus] || "bg-gray-100 text-gray-500"
              )}
            >
              {displayStatus}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Last Active</p>
            <p className="text-sm font-medium text-gray-900">
              {formatRelativeTime(user.lastActiveAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#EBEBEB]">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  EditUserModal                                                      */
/* ------------------------------------------------------------------ */

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ApiUser | null
}

export function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
  const updateUser = useUpdateUser()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
  })

  // Reset form with user data when modal opens or user changes
  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role.toLowerCase(),
        status: user.status.toLowerCase(),
      })
      setApiError(null)
    }
  }, [open, user, reset])

  if (!user) return null

  const onSubmit = async (values: EditUserValues) => {
    setApiError(null)
    try {
      const payload: Record<string, string> = {
        id: user.id,
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
      }
      // Only include password if provided
      if (values.password) {
        payload.password = values.password
      }
      await updateUser.mutateAsync(payload as { id: string } & Record<string, string>)
      onOpenChange(false)
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the details for {user.name}&apos;s account.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-2" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Password (leave blank to keep unchanged)</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep current"
              className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#EBEBEB]"
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="admin" disabled={updateUser.isPending}>
              {updateUser.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  DeleteUserModal                                                    */
/* ------------------------------------------------------------------ */

interface DeleteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ApiUser | null
}

export function DeleteUserModal({ open, onOpenChange, user }: DeleteUserModalProps) {
  const deleteUser = useDeleteUser()
  const [apiError, setApiError] = useState<string | null>(null)

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!open) setApiError(null)
  }, [open])

  if (!user) return null

  const handleDelete = async () => {
    setApiError(null)
    try {
      await deleteUser.mutateAsync(user.id)
      onOpenChange(false)
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
            <TriangleAlert className="h-7 w-7 text-red-600" />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="text-center">Delete User</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{user.name}</span>?
              This action cannot be undone and all associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
        </div>

        {apiError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600 text-center">
            {apiError}
          </div>
        )}

        <DialogFooter className="sm:justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#EBEBEB] min-w-[100px]"
            disabled={deleteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="min-w-[100px]"
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
