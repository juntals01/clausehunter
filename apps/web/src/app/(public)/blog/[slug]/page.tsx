import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPostClient } from "./blog-post-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

async function getPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) {
    return { title: "Post Not Found" }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expirationreminderai.com"
  const title = post.metaTitle || post.title
  const description =
    post.metaDescription || post.excerpt || post.content?.replace(/<[^>]*>/g, "").slice(0, 160)
  const ogImage = post.ogImage || post.coverImageUrl

  return {
    title: `${title} | Clause Hunter Blog`,
    description,
    alternates: {
      canonical: post.canonicalUrl || `${siteUrl}/blog/${post.slug}`,
    },
    keywords: post.metaKeywords || undefined,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expirationreminderai.com"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description:
      post.metaDescription || post.excerpt || post.content?.replace(/<[^>]*>/g, "").slice(0, 160),
    image: post.ogImage || post.coverImageUrl || undefined,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Clause Hunter",
      url: siteUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} />
    </>
  )
}
