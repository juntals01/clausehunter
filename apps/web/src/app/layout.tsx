import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Providers } from "@/lib/providers"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://expirationreminderai.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Expiration Reminder AI — AI-Powered Contract Renewal Tracking",
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
    "contract expiration tracker",
    "subscription management",
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
    title: "Expiration Reminder AI — AI-Powered Contract Renewal Tracking",
    description:
      "Stop accidental contract auto-renewals. Upload your contracts and let AI extract key clauses, track renewal dates, and send timely alerts.",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Expiration Reminder AI — Never miss a contract renewal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expiration Reminder AI — AI-Powered Contract Renewal Tracking",
    description:
      "Stop accidental contract auto-renewals. Upload your contracts and let AI extract key clauses, track renewal dates, and send timely alerts.",
    creator: "@expirationreminderai",
    images: [`${siteUrl}/opengraph-image`],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Expiration Reminder AI",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered contract analysis that detects auto-renewal clauses, tracks cancellation deadlines, and sends timely email alerts.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "Up to 3 contracts with basic email alerts",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "19",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description:
        "Unlimited contracts, advanced alerts, confidence scores, and clause preview",
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "49",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description:
        "Everything in Pro plus team collaboration, admin dashboard, and SSO",
    },
  ],
  featureList: [
    "AI clause extraction",
    "Auto-renewal detection",
    "OCR for scanned documents",
    "Email deadline alerts",
    "Confidence scores",
    "Team collaboration",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
