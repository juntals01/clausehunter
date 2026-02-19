"use client"

import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

function getInitials(name: string | undefined | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface UserAvatarProps {
  size?: number
  className?: string
  fallbackClassName?: string
  /** When provided, display this user instead of the current auth user */
  name?: string
  /** When provided, use this image URL instead of the current user's avatar */
  image?: string
}

export function UserAvatar({
  size = 32,
  className = "",
  fallbackClassName = "bg-[#EA580C]",
  name: nameProp,
  image: imageProp,
}: UserAvatarProps) {
  const { user } = useAuth()
  const name = nameProp ?? user?.name
  const image = imageProp ?? user?.avatar

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? ""}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium ${fallbackClassName} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.375 }}
    >
      {getInitials(name)}
    </div>
  )
}
