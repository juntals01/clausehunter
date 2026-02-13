import Link from "next/link"
import { FileSearch } from "lucide-react"

export function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 sm:px-8 lg:px-[120px] py-6 sm:py-8 bg-[#FFFBF5] border-t border-[#E7E5E4] w-full">
      <div className="flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-[#EA580C] rounded-[10px]">
            <FileSearch className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-display text-sm font-semibold text-[#0D0D0D]">Clause Hunter</span>
        </Link>
        <span className="text-[13px] text-[#7A7A7A]">&copy; 2026</span>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/privacy" className="text-[13px] text-[#7A7A7A] hover:text-[#1C1917] transition-colors">Privacy</Link>
        <Link href="/terms" className="text-[13px] text-[#7A7A7A] hover:text-[#1C1917] transition-colors">Terms</Link>
        <Link href="/contact" className="text-[13px] text-[#7A7A7A] hover:text-[#1C1917] transition-colors">Contact</Link>
      </div>
    </footer>
  )
}
