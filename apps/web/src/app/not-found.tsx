import Link from "next/link"
import { FileSearch } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFBF5] px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="relative mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#F97316] shadow-lg shadow-orange-200">
            <FileSearch className="w-10 h-10 text-white" />
          </div>
          <span className="absolute -top-3 -right-6 font-display text-7xl font-bold text-[#EA580C]/10 select-none">
            ?
          </span>
        </div>

        <p className="font-display text-8xl font-bold tracking-tight text-[#1C1917]">
          404
        </p>

        <h1 className="mt-4 font-display text-xl font-semibold text-[#1C1917]">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[#78716C]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200/50 transition-all hover:bg-[#DC4A04] hover:shadow-lg hover:shadow-orange-200/60 active:scale-[0.98]"
        >
          Return Home
        </Link>

        <p className="mt-12 text-xs text-[#A8A29E]">
          Expiration Reminder AI
        </p>
      </div>
    </div>
  )
}
