import type { Metadata } from "next"
import { BlogListClient } from "./blog-list-client"

export const metadata: Metadata = {
  title: "Blog | Clause Hunter — Contract Management Insights",
  description:
    "Read the latest articles on contract management, renewal tracking, and how AI can help you never miss a deadline again.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Clause Hunter",
    description:
      "Read the latest articles on contract management, renewal tracking, and AI-powered document analysis.",
    url: "/blog",
    type: "website",
  },
}

export default function BlogPage() {
  return <BlogListClient />
}
