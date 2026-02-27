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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { HeroDropzone } from "@/components/hero-dropzone"

export const metadata: Metadata = {
  title: "Expiration Reminder AI — Never Miss a Contract Renewal Again",
  description:
    "Upload your contracts and let AI extract key clauses, track renewal dates, and send timely alerts. Stop accidental auto-renewals and save thousands.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Expiration Reminder AI — Never Miss a Contract Renewal Again",
    description:
      "Upload your contracts and let AI extract key clauses, track renewal dates, and send timely alerts. Stop accidental auto-renewals and save thousands.",
    url: "/",
    type: "website",
  },
}

const steps = [
  {
    number: 1,
    title: "Upload Your PDF",
    description:
      "Drag and drop or browse to upload your contract. We support PDF, DOCX, and scanned documents.",
    icon: Upload,
    iconColor: "text-[#EA580C]",
    gradient: "bg-gradient-to-b from-[#3B82F6] to-[#2563EB]",
  },
  {
    number: 2,
    title: "We Extract Renewal Terms",
    description:
      "Our AI reads every clause, identifies auto-renewal terms, notice periods, and cancellation deadlines.",
    icon: Brain,
    iconColor: "text-[#EA580C]",
    gradient: "bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED]",
  },
  {
    number: 3,
    title: "Get Alerted Before Deadlines",
    description:
      "Receive timely email alerts before your cancellation window closes. Never miss a deadline again.",
    icon: Bell,
    iconColor: "text-[#F59E0B]",
    gradient: "bg-gradient-to-b from-[#F59E0B] to-[#D97706]",
  },
]

const features = [
  {
    title: "Auto-renewal Detection",
    description:
      "Instantly identifies auto-renewal clauses buried deep in your contracts using advanced AI analysis.",
    icon: ScanSearch,
    iconColor: "text-[#EA580C]",
    iconBg: "bg-[#FFF7ED]",
  },
  {
    title: "Notice Period Extraction",
    description:
      "Extracts exact notice period requirements so you know precisely when action is needed.",
    icon: Calendar,
    iconColor: "text-[#EA580C]",
    iconBg: "bg-[#FFF7ED]",
  },
  {
    title: "Cancel-by Deadline",
    description:
      "Calculates and highlights the last possible date to cancel, so you never miss your window.",
    icon: AlarmClock,
    iconColor: "text-[#F59E0B]",
    iconBg: "bg-[#FEF3C7]",
  },
  {
    title: "Email Alerts",
    description:
      "Automated email reminders sent at the right time — 30, 14, and 7 days before each deadline.",
    icon: BellRing,
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#DCFCE7]",
  },
  {
    title: "Confidence + Clause Preview",
    description:
      "See AI confidence scores and highlighted clause excerpts so you can verify every extraction.",
    icon: FileCheck,
    iconColor: "text-[#EF4444]",
    iconBg: "bg-[#FEE2E2]",
  },
]

const companies = ["Acme Corp", "TechStart", "ScaleUp", "DataFlow", "CloudNine"]

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
                  AI-Powered Contract Analysis
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] tracking-tight max-w-[520px] mb-5">
              Never get trapped by auto-renewals again.
            </h1>

            {/* Subhead */}
            <p className="text-base lg:text-[17px] text-[#78716C] leading-[1.7] max-w-[480px] mb-8">
              Upload any contract and our AI will instantly detect auto-renewal
              clauses, notice periods, and cancellation deadlines — so you never
              pay for something you meant to cancel.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-[#EA580C] text-white font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 hover:bg-[#DC5409] transition-colors w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-[#E7E5E4] bg-white text-[#1C1917] font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 hover:bg-[#FAFAF9] transition-colors w-full sm:w-auto"
              >
                See How It Works
              </Link>
            </div>
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
            Three simple steps to protect yourself from unwanted contract
            renewals and hidden fees.
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
            All your contracts in one place — urgency, deadlines, and actions at a glance.
          </p>
          <div className="w-full max-w-4xl rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-lg bg-white">
            <Image
              src="/dashboard-at-a-glance.png"
              alt="Dashboard view showing contracts and renewal deadlines"
              width={1024}
              height={640}
              className="w-full h-auto"
              priority={false}
            />
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20 bg-[#FFFBF5]">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4 text-center">
            Everything You Need to Stay Protected
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-10 lg:mb-14 text-center max-w-[560px]">
            Powerful features designed to catch what you might miss, so no
            renewal clause ever slips through.
          </p>

          {/* All features in a responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Proof Section ─── */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 md:px-12 lg:px-[120px] py-10 lg:py-12">
        <div className="flex flex-col items-center">
          <p className="text-[11px] tracking-[3px] text-[#B0B0B0] uppercase font-medium mb-6">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
            {companies.map((company) => (
              <span
                key={company}
                className="font-display text-base lg:text-lg font-semibold text-[#D6D3D1]"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner Section ─── */}
      <section className="bg-[#FFF7ED] border-t border-[#FDBA74] px-5 sm:px-8 md:px-12 lg:px-[120px] py-12 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917] mb-4">
            Start with 3 contracts free
          </h2>
          <p className="text-base lg:text-[17px] text-[#78716C] mb-8 max-w-[480px]">
            No credit card required. Upload your first contract in under 60
            seconds and see the magic happen.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-[#EA580C] text-white font-display font-semibold text-sm rounded-[10px] py-3.5 px-7 hover:bg-[#DC5409] transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
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
