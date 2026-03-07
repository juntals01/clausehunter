import type { Metadata } from "next"
import { BlogListClient } from "./blog-list-client"

export const metadata: Metadata = {
  title: "Blog | Expiration Reminder AI — Deadline Tracking Insights",
  description:
    "Expert insights on deadline tracking, contract renewals, HIPAA compliance, and how AI helps you never miss an expiration date again.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Expiration Reminder AI",
    description:
      "Expert insights on deadline tracking, contract renewals, and AI-powered document analysis.",
    url: "/blog",
    type: "website",
  },
}

export default function BlogPage() {
  return <BlogListClient />
}
