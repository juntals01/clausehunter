"use client"

import { useState } from "react"
import Link from "next/link"
import { FileSearch, Menu, X } from "lucide-react"

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="relative bg-white border-b border-[#E7E5E4] w-full">
      <div className="flex items-center justify-between h-16 px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-[#EA580C] rounded-[10px]">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-[#1C1917]">
            Clause Hunter
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="flex items-center justify-center px-5 py-2.5 bg-[#EA580C] text-white text-[13px] font-medium font-display rounded-lg hover:bg-[#DC5409] transition-colors"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 -mr-2 text-[#78716C] hover:text-[#1C1917] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-[#E7E5E4] shadow-lg z-50">
          <nav className="flex flex-col p-4 gap-1">
            <Link
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917] transition-colors"
            >
              Product
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center px-5 py-3 bg-[#EA580C] text-white text-sm font-medium font-display rounded-lg hover:bg-[#DC5409] transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
