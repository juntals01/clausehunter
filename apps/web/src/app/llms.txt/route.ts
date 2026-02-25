import { NextResponse } from "next/server"

export function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://expirationreminderai.com"

  const content = `# Expiration Reminder AI

> AI-powered contract analysis and renewal tracking SaaS. Upload contracts, extract auto-renewal clauses, and get timely deadline alerts.

## About

Expiration Reminder AI helps individuals and teams avoid accidental contract auto-renewals. Users upload PDF, DOCX, or scanned contracts, and the AI extracts key clauses including auto-renewal terms, notice periods, and cancellation deadlines. The platform sends automated email alerts at 30, 14, and 7 days before each deadline.

## Core Features

- **AI Clause Extraction**: Automatically detects auto-renewal clauses, notice periods, and cancellation deadlines using AI analysis
- **OCR Support**: Handles scanned documents via Tesseract.js OCR processing
- **Email Alerts**: Automated reminders sent 30, 14, and 7 days before contract deadlines
- **Confidence Scores**: AI confidence ratings on each extracted clause for verification
- **Clause Preview**: Highlighted clause excerpts from the original document
- **Multi-format Upload**: Supports PDF, DOCX, and scanned document formats
- **Team Collaboration**: Shared contract libraries with role-based access for teams

## Pricing Plans

- **Free**: Up to 3 contracts, basic email alerts, PDF upload
- **Pro ($19/mo)**: Unlimited contracts, advanced alerts, all file formats, confidence scores, clause preview
- **Team ($49/mo)**: Everything in Pro plus up to 10 team members, admin dashboard, SSO, dedicated support

## Pages

- [Home](${siteUrl}): Landing page with product overview and interactive demo
- [Pricing](${siteUrl}/pricing): Plan comparison and signup
- [Contact](${siteUrl}/contact): Contact form for questions and support
- [Privacy Policy](${siteUrl}/privacy): Data handling and privacy practices
- [Terms of Service](${siteUrl}/terms): Usage terms and conditions

## Technical Stack

- Frontend: Next.js (React), Tailwind CSS
- API: NestJS REST API
- AI: Kimi AI for clause extraction, Tesseract.js for OCR
- Storage: MinIO for file storage, PostgreSQL for data
- Queue: BullMQ with Redis for background processing
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
