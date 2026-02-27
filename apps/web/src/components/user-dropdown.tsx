"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Settings,
  HelpCircle,
  User,
  LogOut,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

interface UserDropdownProps {
  /** For admin pages, use indigo fallback */
  variant?: "user" | "admin"
}

export function UserDropdown({ variant = "user" }: UserDropdownProps) {
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const isAdmin = variant === "admin"
  const basePath = isAdmin ? "/admin" : ""

  if (!mounted) {
    return (
      <div className="rounded-full">
        <UserAvatar fallbackClassName={isAdmin ? "bg-[#4F46E5]" : "bg-[#EA580C]"} />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2">
          <UserAvatar
            fallbackClassName={isAdmin ? "bg-[#4F46E5]" : "bg-[#EA580C]"}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-[#1C1917]">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs leading-none text-[#78716C]">
              {user?.email ?? ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Navigation items */}
        <DropdownMenuGroup>
          {!isAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account" className="cursor-pointer">
                  <User className="h-4 w-4 text-[#78716C]" />
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 text-[#78716C]" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing" className="cursor-pointer">
                  <CreditCard className="h-4 w-4 text-[#78716C]" />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href={isAdmin ? "/admin" : "/dashboard/help"} className="cursor-pointer">
              <HelpCircle className="h-4 w-4 text-[#78716C]" />
              <span>Help</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
