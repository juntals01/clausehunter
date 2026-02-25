import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing — Simple, Transparent Plans",
  description:
    "Start free with 3 contracts. Upgrade to Pro for unlimited contracts, advanced alerts, and clause previews — or go Team for shared access and admin controls.",
  alternates: { canonical: "/pricing" },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
