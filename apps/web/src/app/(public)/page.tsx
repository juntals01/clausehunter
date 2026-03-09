import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  Sparkles,
  Upload,
  Brain,
  Bell,
  ArrowRight,
  ScanSearch,
  Calendar,
  AlarmClock,
  BellRing,
  FileCheck,
  ShieldCheck,
  FileText,
  Package,
  Stethoscope,
  HardHat,
  Scale,
  Briefcase,
  Server,
  Building2,
  Zap,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
  Clock,
  Shield,
  Lock,
  Eye,
  ServerCrash,
  Star,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { HeroDropzone } from "@/components/hero-dropzone"

export const metadata: Metadata = {
  title: "Expiration Reminder AI — Stop Losing Money to Missed Renewals",
  description:
    "AI-powered deadline tracking for contracts, licenses, insurance, and certifications. Upload a document, get dates extracted in 30 seconds, and receive alerts before every expiration. HIPAA compliant. Free to start.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Expiration Reminder AI — Stop Losing Money to Missed Renewals",
    description:
      "Upload contracts and documents. AI extracts deadlines, notice periods, and renewal clauses in 30 seconds. Get email alerts before every expiration. HIPAA compliant.",
    url: "/",
    type: "website",
  },
}

const steps = [
  {
    number: 1,
    title: "Upload or Add Your Documents",
    description:
      "Upload contracts for AI analysis, or manually add any document — licenses, insurance, certifications, permits, and more.",
    icon: Upload,
    iconColor: "text-[#EA580C]",
    gradient: "bg-gradient-to-b from-[#3B82F6] to-[#2563EB]",
  },
  {
    number: 2,
    title: "AI Extracts Key Dates",
    description:
      "Our AI reads uploaded documents and extracts renewal terms, notice periods, and cancellation deadlines automatically.",
    icon: Brain,
    iconColor: "text-[#EA580C]",
    gradient: "bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED]",
  },
  {
    number: 3,
    title: "Get Alerted Before Deadlines",
    description:
      "Receive timely email alerts before your deadlines. Never miss an expiration, renewal, or cancellation window again.",
    icon: Bell,
    iconColor: "text-[#F59E0B]",
    gradient: "bg-gradient-to-b from-[#F59E0B] to-[#D97706]",
  },
]

const features = [
  {
    title: "AI-Powered Extraction",
    description:
      "Upload contracts and let AI instantly extract auto-renewal clauses, notice periods, and key dates with confidence scores.",
    icon: ScanSearch,
    iconColor: "text-[#EA580C]",
    iconBg: "bg-[#FFF7ED]",
  },
  {
    title: "Track Any Document Type",
    description:
      "Contracts, licenses, insurance, certifications, permits, subscriptions, leases — track any document with a due date.",
    icon: FileText,
    iconColor: "text-[#EA580C]",
    iconBg: "bg-[#FFF7ED]",
  },
  {
    title: "Cancel-by Deadlines",
    description:
      "Automatically calculates and highlights the last possible date to cancel, so you never miss your window.",
    icon: AlarmClock,
    iconColor: "text-[#F59E0B]",
    iconBg: "bg-[#FEF3C7]",
  },
  {
    title: "Smart Email Alerts",
    description:
      "Automated email reminders sent at the right time — 30, 14, and 7 days before each deadline hits.",
    icon: BellRing,
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#DCFCE7]",
  },
  {
    title: "Color-Coded Dashboard",
    description:
      "See what's safe, approaching, or urgent at a glance. Color-coded status indicators make deadlines impossible to miss.",
    icon: ShieldCheck,
    iconColor: "text-[#3B82F6]",
    iconBg: "bg-[#EFF6FF]",
  },
  {
    title: "Item-Level Tracking & Alerts",
    description:
      "AI extracts individual items within documents — each device, license, or asset gets its own expiry date and email reminder.",
    icon: Package,
    iconColor: "text-[#8B5CF6]",
    iconBg: "bg-[#F5F3FF]",
  },
]

const industries = [
  {
    title: "Healthcare Professionals",
    description: "Medical licenses, DEA registrations, malpractice insurance, board certifications",
    icon: Stethoscope,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    title: "Construction & Contractors",
    description: "Business licenses, contractor bonds, insurance policies, equipment certifications",
    icon: HardHat,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    title: "Legal Professionals",
    description: "Bar licenses, professional liability insurance, client contract deadlines, CLE requirements",
    icon: Scale,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    title: "Small Business Owners",
    description: "Business licenses, vendor contracts, domain renewals, SSL certificates, lease agreements",
    icon: Briefcase,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
  },
  {
    title: "IT & Tech Teams",
    description: "SSL certificates, domain names, software licenses, cloud subscriptions, security audits",
    icon: Server,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    title: "Property Management",
    description: "Property insurance, building permits, safety inspections, tenant lease renewals",
    icon: Building2,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
  },
]

const testimonials = [
  {
    quote: "We were tracking 40+ vendor contracts in a spreadsheet. After switching to Expiration Reminder AI, we caught three auto-renewals we would have missed — saving us over $12,000.",
    name: "Sarah Chen",
    role: "Operations Manager",
    company: "MedPoint Health",
  },
  {
    quote: "As a solo practitioner, keeping track of my medical license, DEA registration, and malpractice insurance was stressful. Now I upload once and get alerts automatically. Total peace of mind.",
    name: "Dr. James Rivera",
    role: "Family Physician",
    company: "Rivera Family Medicine",
  },
  {
    quote: "Our IT team manages SSL certs, domain renewals, and software licenses across 200+ services. This tool paid for itself the first month by preventing a certificate expiration that would have taken our API offline.",
    name: "Marcus Thompson",
    role: "DevOps Lead",
    company: "NexGen Solutions",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* ─── Hero Section ─── */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 md:py-16 lg:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-10 lg:gap-[60px]">
          {/* Left Side */}
          <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left">
            {/* Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FDBA74] rounded-full px-4 py-1.5">
                <Sparkles className="w-4 h-4 text-[#EA580C]" />
                <span className="text-sm font-medium text-[#EA580C]">
                  HIPAA Compliant &middot; AI-Powered
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] tracking-tight max-w-[540px] mb-5">
              Stop losing money to missed renewals and expired documents.
            </h1>

            {/* Subhead */}
            <p className="text-base lg:text-[17px] text-[#78716C] leading-[1.7] max-w-[480px] mb-8">
              Upload any contract and AI extracts deadlines, notice periods, and
              renewal clauses in 30 seconds. Or add any deadline manually.
              Get email alerts before every expiration.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-[#EA580C] text-white font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 hover:bg-[#DC5409] transition-colors w-full sm:w-auto shadow-lg shadow-orange-200/50"
              >
                Start Tracking Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-[#E7E5E4] bg-white text-[#1C1917] font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 hover:bg-[#FAFAF9] transition-colors w-full sm:w-auto"
              >
                See How It Works
              </Link>
            </div>

            <p className="mt-4 text-xs text-[#A8A29E]">
              Free forever for 3 documents &middot; No credit card required &middot; Setup in 60 seconds
            </p>
          </div>

          {/* Right Side — Dropzone Card */}
          <HeroDropzone />
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section id="how-it-works" className="bg-white px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            How It Works
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[520px]">
            Three simple steps to protect yourself from missed deadlines,
            expired documents, and costly penalties.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="flex flex-col rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 bg-gradient-to-b from-white to-[#F8FAFC]"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-display font-bold text-sm",
                        step.gradient
                      )}
                    >
                      {step.number}
                    </div>
                    <div className="w-10 h-10 rounded-[10px] bg-[#FFF7ED] flex items-center justify-center">
                      <Icon className={cn("w-5 h-5", step.iconColor)} />
                    </div>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#1C1917] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#78716C] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Dashboard at a Glance ─── */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            Your Dashboard at a Glance
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 text-center max-w-[560px]">
            All your documents in one place — color-coded urgency, deadlines, and actions at a glance.
          </p>
          <div className="w-full max-w-4xl rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-lg bg-white">
            <Image
              src="/dashboard-at-a-glance.png"
              alt="Dashboard view showing documents and expiration deadlines"
              width={1024}
              height={640}
              className="w-full h-auto"
              priority={false}
            />
          </div>
        </div>
      </section>

      {/* ─── AI Extraction Demo ─── */}
      <section className="bg-white px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FDBA74] rounded-full px-4 py-1.5">
              <Brain className="w-4 h-4 text-[#EA580C]" />
              <span className="text-sm font-medium text-[#EA580C]">
                See It in Action
              </span>
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            AI-Powered Contract Renewal Tracking
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[580px]">
            Upload any contract and our AI instantly identifies renewal clauses,
            notice periods, and critical deadlines — so you know exactly when to act.
          </p>

          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-6 lg:gap-0">
            {/* Left: Contract Snippet */}
            <div className="flex-1 rounded-2xl lg:rounded-r-none border border-[#E7E5E4] bg-gradient-to-b from-[#FAFAF9] to-white p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#F5F5F4] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#78716C]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#78716C] uppercase tracking-wider">Uploaded Document</p>
                  <p className="text-sm font-semibold text-[#1C1917]">office-lease-agreement.pdf</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-white border border-[#E7E5E4] p-5 font-mono text-[13px] leading-[1.8] text-[#44403C] space-y-4">
                <p className="text-[#A8A29E]">// Section 4.2 — Term & Renewal</p>
                <p>
                  The initial term of this Lease shall commence on{" "}
                  <span className="bg-blue-50 text-blue-700 px-1 rounded font-semibold">January 1, 2025</span>{" "}
                  and shall expire on{" "}
                  <span className="bg-red-50 text-red-600 px-1 rounded font-semibold">December 31, 2026</span>,
                  unless sooner terminated in accordance with the provisions hereof.
                </p>
                <p>
                  This Agreement shall{" "}
                  <span className="bg-amber-50 text-amber-700 px-1 rounded font-semibold">automatically renew</span>{" "}
                  for successive{" "}
                  <span className="bg-violet-50 text-violet-700 px-1 rounded font-semibold">12-month</span>{" "}
                  periods unless either party provides written notice of non-renewal at least{" "}
                  <span className="bg-orange-50 text-[#EA580C] px-1 rounded font-semibold">60 days</span>{" "}
                  prior to the expiration of the then-current term.
                </p>
                <p className="text-[#A8A29E]">// Section 8.1 — Early Termination</p>
                <p>
                  In the event of early termination, Tenant shall pay a fee equal to{" "}
                  <span className="bg-red-50 text-red-600 px-1 rounded font-semibold">3 months&apos; rent</span>.
                </p>
              </div>
            </div>

            {/* Center: AI Transform Indicator */}
            <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0 lg:px-0 lg:-mx-5 z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EA580C] to-[#F97316] shadow-lg shadow-orange-200/60 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">AI</span>
            </div>

            {/* Right: Extraction Result */}
            <div className="flex-1 rounded-2xl lg:rounded-l-none border border-[#E7E5E4] bg-white p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                  <ScanSearch className="w-4 h-4 text-[#EA580C]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#78716C] uppercase tracking-wider">AI Extraction</p>
                  <p className="text-sm font-semibold text-[#1C1917]">Office Lease Agreement</p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {/* Extracted fields */}
                <div className="flex items-center justify-between py-2.5 border-b border-[#F5F5F4]">
                  <span className="flex items-center gap-2 text-sm text-[#78716C]">
                    <CalendarDays className="w-3.5 h-3.5" /> End Date
                  </span>
                  <span className="text-sm font-semibold text-[#1C1917]">Dec 31, 2026</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#F5F5F4]">
                  <span className="flex items-center gap-2 text-sm text-[#78716C]">
                    <Clock className="w-3.5 h-3.5" /> Notice Period
                  </span>
                  <span className="text-sm font-semibold text-[#1C1917]">60 days</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#F5F5F4]">
                  <span className="flex items-center gap-2 text-sm text-[#78716C]">
                    <AlarmClock className="w-3.5 h-3.5" /> Cancel By
                  </span>
                  <span className="text-sm font-semibold text-amber-600">Nov 1, 2026</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#F5F5F4]">
                  <span className="flex items-center gap-2 text-sm text-[#78716C]">
                    <RefreshCw className="w-3.5 h-3.5" /> Auto-Renews
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Yes — 12 months</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#F5F5F4]">
                  <span className="flex items-center gap-2 text-sm text-[#78716C]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confidence
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="w-3 h-3" /> High
                  </span>
                </div>

                {/* Clause preview */}
                <div className="mt-4 rounded-xl border-l-4 border-[#EA580C] bg-orange-50/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-1.5">Renewal Clause Detected</p>
                  <p className="text-xs text-[#44403C] leading-relaxed italic">
                    &ldquo;This Agreement shall automatically renew for successive 12-month
                    periods unless either party provides written notice of non-renewal
                    at least 60 days prior...&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20 bg-[#FFFBF5]">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            AI-Powered Tracking and More
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[560px]">
            From automatic contract renewal detection to smart deadline alerts — everything
            you need to stay ahead of expirations across all your documents.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Item-Level Tracking Showcase ─── */}
      <section className="bg-white px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 order-2 lg:order-1">
              <span className="inline-flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FDBA74] rounded-full px-3 py-1 text-xs font-semibold text-[#EA580C] mb-4">
                <Package className="w-3.5 h-3.5" />
                NEW FEATURE
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4">
                Item-Level Expiry Reminders
              </h2>
              <p className="text-base lg:text-[17px] text-[#78716C] mb-6 leading-relaxed">
                Documents often contain dozens of individual items — devices, licenses, assets — each with its own expiry date.
                Our AI extracts every single one and tracks them separately, so nothing slips through the cracks.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "AI auto-extracts items from uploaded documents",
                  "Each item gets its own due date and status tracking",
                  "Email alerts at 30, 7, and 0 days before expiry",
                  "Color-coded urgency: Overdue, Critical, Expiring Soon",
                  "Add, edit, or remove items manually anytime",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#44403C]">
                    <div className="w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 font-display font-semibold text-sm bg-[#EA580C] text-white rounded-[10px] py-3 px-7 hover:bg-[#DC5409] transition-colors"
              >
                Try It Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <div className="rounded-2xl border border-[#E7E5E4] shadow-xl overflow-hidden bg-white">
                <Image
                  src="/images/items-tracking-preview.png"
                  alt="Item-level expiry tracking showing individual devices with due dates, status badges, and days left"
                  width={850}
                  height={720}
                  className="w-full h-auto"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Built for Every Professional ─── */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            Built for Every Professional
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[560px]">
            From healthcare to construction, legal to IT — track critical
            deadlines across any industry.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className="flex flex-col rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 bg-gradient-to-b from-white to-[#F8FAFC]"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
                    industry.iconBg
                  )}
                >
                  <industry.icon className={cn("w-5 h-5", industry.iconColor)} />
                </div>
                <h3 className="font-display text-lg font-bold text-[#1C1917] mb-2">
                  {industry.title}
                </h3>
                <p className="text-sm text-[#78716C] leading-relaxed">
                  {industry.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Security & Compliance ─── */}
      <section className="bg-white px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                HIPAA Compliant
              </span>
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            Enterprise-Grade Security
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[580px]">
            Your documents contain sensitive information. We protect them with
            HIPAA-compliant infrastructure and industry-leading security practices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full max-w-5xl">
            <div className="flex flex-col items-center text-center rounded-2xl border border-[#E7E5E4] p-6 bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-display text-base font-bold text-[#1C1917] mb-2">
                HIPAA Compliant
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                Fully compliant with HIPAA regulations for handling protected health information and sensitive documents.
              </p>
            </div>

            <div className="flex flex-col items-center text-center rounded-2xl border border-[#E7E5E4] p-6 bg-white">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-display text-base font-bold text-[#1C1917] mb-2">
                Encrypted at Rest &amp; Transit
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                AES-256 encryption for stored documents and TLS 1.3 for all data in transit. Your files are never exposed.
              </p>
            </div>

            <div className="flex flex-col items-center text-center rounded-2xl border border-[#E7E5E4] p-6 bg-white">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-display text-base font-bold text-[#1C1917] mb-2">
                Zero Third-Party Sharing
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                Your documents are never shared, sold, or used for training. AI processing happens in isolated, secure environments.
              </p>
            </div>

            <div className="flex flex-col items-center text-center rounded-2xl border border-[#E7E5E4] p-6 bg-white">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <ServerCrash className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-display text-base font-bold text-[#1C1917] mb-2">
                SOC 2 Infrastructure
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                Hosted on SOC 2 certified infrastructure with automated backups, audit logs, and 99.9% uptime guarantee.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 text-sm text-[#78716C]">
            <Link href="/privacy" className="hover:text-[#EA580C] transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-[#D6D3D1]" />
            <Link href="/terms" className="hover:text-[#EA580C] transition-colors underline underline-offset-2">
              Terms of Service
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-white px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            Trusted by Professionals Like You
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[520px]">
            See how teams use Expiration Reminder AI to protect their businesses from costly missed deadlines.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 bg-gradient-to-b from-white to-[#FAFAF9]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#44403C] leading-relaxed flex-1 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 pt-4 border-t border-[#F5F5F4]">
                  <p className="text-sm font-semibold text-[#1C1917]">{t.name}</p>
                  <p className="text-xs text-[#78716C]">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Blog Preview ─── */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            From the Blog
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[520px]">
            Expert insights on deadline tracking, contract management, and compliance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {[
              {
                title: "The Hidden Cost of Missed Contract Renewals",
                excerpt: "Businesses lose $7.2B yearly to auto-renewed contracts. Learn the real cost and how to prevent it.",
                slug: "hidden-cost-missed-contract-renewals",
                icon: FileText,
              },
              {
                title: "5 Documents Every Healthcare Pro Must Track",
                excerpt: "From medical licenses to DEA registrations — the critical expirations that can shut down your practice.",
                slug: "healthcare-documents-must-track",
                icon: Stethoscope,
              },
              {
                title: "How AI Document Extraction Actually Works",
                excerpt: "From PDF to structured data in 30 seconds — a behind-the-scenes look at OCR and intelligent extraction.",
                slug: "how-ai-document-extraction-works",
                icon: Brain,
              },
            ].map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 bg-white hover:shadow-lg hover:shadow-orange-100/40 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] flex items-center justify-center mb-4">
                  <post.icon className="w-5 h-5 text-[#EA580C]" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#1C1917] mb-2 group-hover:text-[#EA580C] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[#78716C] leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <span className="mt-4 text-sm font-medium text-[#EA580C] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/blog"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#EA580C] hover:text-[#C2410C] transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            View all articles
          </Link>
        </div>
      </section>

      {/* ─── CTA Banner Section ─── */}
      <section className="bg-[#FFF7ED] border-t border-[#FDBA74] px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4">
            Your next missed deadline could cost you thousands
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-8 max-w-[520px]">
            Upload your first document in 60 seconds. AI extracts the deadlines.
            You get alerts before they pass. Free for up to 3 documents — forever.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-[#EA580C] text-white font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 hover:bg-[#DC5409] transition-colors shadow-lg shadow-orange-200/50"
          >
            Start Tracking Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-3 text-xs text-[#A8A29E]">
            No credit card required &middot; HIPAA compliant
          </p>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 bg-gradient-to-b from-white to-[#F8FAFC]">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
          iconBg
        )}
      >
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <h3 className="font-display text-lg sm:text-xl font-bold text-[#1C1917] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#78716C] leading-relaxed">{description}</p>
    </div>
  )
}
