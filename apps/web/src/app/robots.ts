import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clausehunter.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/upload", "/contracts", "/settings", "/billing", "/help", "/account"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
