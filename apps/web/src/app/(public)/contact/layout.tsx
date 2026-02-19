import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the ExpirationReminderAI team. We're here to help with questions about contract analysis, account setup, and more.",
  alternates: { canonical: "/contact" },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
