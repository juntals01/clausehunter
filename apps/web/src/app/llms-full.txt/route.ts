import { NextResponse } from "next/server"

export function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://expirationreminderai.com"

  const content = `# Expiration Reminder AI — Full Documentation

> AI-powered contract analysis and renewal tracking SaaS. Upload contracts, extract auto-renewal clauses, and get timely deadline alerts before cancellation windows close.

## About

Expiration Reminder AI is a SaaS platform that solves the problem of accidental contract auto-renewals. Many SaaS subscriptions, vendor agreements, and service contracts contain auto-renewal clauses with narrow cancellation windows. Missing these deadlines means being locked into another term — often costing thousands of dollars.

The platform uses AI to read and analyze uploaded contracts, extracting critical terms like:
- Whether the contract auto-renews
- The notice period required for cancellation
- The exact cancel-by deadline
- Relevant clause text and context

Users receive automated email alerts at 30, 14, and 7 days before each cancellation deadline, ensuring they never miss their window to act.

## How It Works

### Step 1: Upload Your Contract
Users upload contracts in PDF, DOCX, or scanned image format. The platform accepts drag-and-drop uploads and supports documents of any length. Scanned documents are processed through OCR (Tesseract.js) to extract text.

### Step 2: AI Clause Extraction
The uploaded document is queued for background processing via BullMQ. The AI engine (powered by Kimi AI) analyzes the full document text to identify and extract:
- **Auto-renewal clause**: Whether the contract automatically renews
- **Notice period**: How many days before renewal the user must notify to cancel
- **Cancel-by date**: The calculated last possible date to cancel
- **Confidence score**: How confident the AI is in each extraction (0-100%)
- **Clause excerpt**: The relevant text from the contract

### Step 3: Get Alerted
Once processed, the contract appears on the user's dashboard with all extracted information. The platform schedules email alerts at configurable intervals before the cancellation deadline.

## Core Features

### AI Clause Extraction
Uses Kimi AI to analyze contract documents and extract renewal-related terms. The AI identifies auto-renewal clauses even when they're buried in dense legal language. Each extraction includes a confidence score and the original clause text for user verification.

### OCR Processing
Scanned documents and image-based PDFs are processed through Tesseract.js OCR to extract readable text before AI analysis. This ensures even photographed or faxed contracts can be analyzed.

### Smart Email Alerts
Automated email reminders are sent at strategic intervals:
- 30 days before the cancellation deadline
- 14 days before the cancellation deadline
- 7 days before the cancellation deadline

### Dashboard & Contract Management
Users have a personal dashboard showing all their contracts, upcoming deadlines, and alert status. Each contract has a detail view showing the AI-extracted clauses, confidence scores, and original document.

### Team Features (Team Plan)
- Shared contract library across team members
- Role-based access control
- Admin dashboard for team management
- Activity logging
- SSO integration

## Pricing

### Free Plan — $0/month
- Up to 3 contracts
- Auto-renewal detection
- Basic email alerts (7-day window)
- PDF upload support
- Perfect for personal use or trying the platform

### Pro Plan — $19/month
- Unlimited contracts
- Auto-renewal detection
- Advanced email alerts (30/14/7-day windows)
- PDF, DOCX, and scanned document support
- AI confidence scores
- Clause preview and export
- Priority support
- Best for professionals managing multiple contracts

### Team Plan — $49/month
- Everything in Pro
- Up to 10 team members
- Admin dashboard
- Role-based access control
- Team activity log
- Shared contract library
- SSO integration
- Dedicated support
- Best for teams and organizations

## Pages

- [Home](${siteUrl}): Landing page with product overview, how-it-works section, feature highlights, social proof, and call-to-action. Includes an interactive demo dropzone for immediate file upload.
- [Pricing](${siteUrl}/pricing): Detailed plan comparison with feature lists, pricing, and signup/checkout integration via LemonSqueezy.
- [Contact](${siteUrl}/contact): Contact form for questions, feedback, and support requests. Includes response time information and urgent request handling.
- [Privacy Policy](${siteUrl}/privacy): Comprehensive privacy policy covering data collection, contract document handling, encryption practices, and third-party data sharing policies.
- [Terms of Service](${siteUrl}/terms): Terms governing usage of the platform, including acceptable use, data ownership, service availability, and liability limitations.
- [Sign Up](${siteUrl}/sign-up): Account registration with email/password or Google OAuth.
- [Sign In](${siteUrl}/sign-in): User authentication page.

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Fonts**: Space Grotesk (headings), Inter (body)

### Backend API
- **Framework**: NestJS REST API
- **Database**: PostgreSQL 16 via TypeORM
- **Authentication**: JWT-based auth with Google OAuth support
- **File Storage**: MinIO (S3-compatible object storage)
- **Payments**: LemonSqueezy integration for subscription billing

### Background Processing
- **Queue**: BullMQ with Redis 7
- **Worker**: NestJS worker service
- **OCR**: Tesseract.js for scanned document text extraction
- **AI**: Kimi AI for clause extraction and analysis

### Infrastructure
- Docker Compose for local development
- Turborepo monorepo management
- Shared TypeORM entities and Zod schemas across services

## Contact

For questions, support, or partnership inquiries, visit the [Contact page](${siteUrl}/contact).
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
