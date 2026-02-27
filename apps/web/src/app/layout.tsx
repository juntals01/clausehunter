import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Providers } from "@/lib/providers"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://expirationreminderai.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Expiration Reminder AI — Never Miss a Critical Deadline Again",
    template: "%s | Expiration Reminder AI",
  },
  description:
    "Track expiration dates for contracts, licenses, insurance, certifications, and more. AI-powered extraction for uploaded documents, plus manual tracking for any deadline.",
  keywords: [
    "expiration tracking",
    "deadline tracking",
    "document expiration",
    "license renewal tracking",
    "contract renewal tracking",
    "insurance expiration",
    "certification tracking",
    "AI contract analysis",
    "renewal alerts",
    "deadline reminders",
    "permit tracking",
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
    title: "Expiration Reminder AI — Never Miss a Critical Deadline Again",
    description:
      "Track expiration dates for contracts, licenses, insurance, certifications, and more. AI-powered document analysis and deadline tracking.",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Expiration Reminder AI — Never miss a critical deadline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expiration Reminder AI — Never Miss a Critical Deadline Again",
    description:
      "Track expiration dates for contracts, licenses, insurance, certifications, and more. AI-powered document analysis and deadline tracking.",
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
    "Track expiration dates for contracts, licenses, insurance, certifications, and more. AI-powered document analysis and deadline tracking with automated email alerts.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "Up to 3 documents with basic email alerts",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "19",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description:
        "Unlimited documents, AI extraction, advanced alerts, and clause preview",
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
    "Multi-document type tracking",
    "License and certification tracking",
    "OCR for scanned documents",
    "Email deadline alerts",
    "Color-coded urgency dashboard",
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
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-D25ZMRXRFX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D25ZMRXRFX');
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
