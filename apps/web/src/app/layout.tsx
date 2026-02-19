import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Providers } from "@/lib/providers"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expirationreminderai.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Expiration Reminder AI - AI-Powered Contract Renewal Tracking",
    template: "%s | Expiration Reminder AI",
  },
  description:
    "Stop accidental contract auto-renewals. Upload your contracts and let AI extract key clauses, track renewal dates, and send timely alerts before deadlines.",
  keywords: [
    "contract management",
    "contract renewal tracking",
    "auto-renewal prevention",
    "AI contract analysis",
    "clause extraction",
    "contract deadlines",
    "renewal alerts",
    "SaaS contract management",
    "vendor management",
    "contract OCR",
  ],
  authors: [{ name: "Expiration Reminder AI" }],
  creator: "Expiration Reminder AI",
  publisher: "Expiration Reminder AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Expiration Reminder AI",
    title: "Expiration Reminder AI - AI-Powered Contract Renewal Tracking",
    description:
      "Stop accidental contract auto-renewals. Upload your contracts and let AI extract key clauses, track renewal dates, and send timely alerts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expiration Reminder AI - AI-Powered Contract Renewal Tracking",
    description:
      "Stop accidental contract auto-renewals. Upload your contracts and let AI extract key clauses, track renewal dates, and send timely alerts.",
    creator: "@expirationreminderai",
  },
  alternates: {
    canonical: siteUrl,
  },
}

export const viewport: Viewport = {
  themeColor: "#EA580C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
