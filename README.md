# Expiration Reminder AI Lite

**Tagline:** Stop accidental contract renewals.

A renewal-first contract tracking MVP that competes with ContractSafe by being faster, cheaper, and focused ONLY on renewal risk.

## Features

✅ **PDF Upload** - Drag & drop contract PDFs  
✅ **AI OCR** - Extract text from scanned and text-based PDFs  
✅ **Smart Extraction** - Kimi K2 AI extracts vendor, end date, notice period, and auto-renewal status  
✅ **Human-in-the-Loop** - Review and edit extracted fields  
✅ **Urgency Dashboard** - Contracts sorted by renewal risk  
✅ **Email Alerts** - Daily notifications at 30, 7, and 0 days before notice deadline

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend API:** NestJS, PostgreSQL, Prisma
- **Worker:** NestJS, BullMQ, Redis
- **AI:** Kimi K2 for extraction, Tesseract.js for OCR
- **Email:** SendGrid or Mailgun

## Project Structure

```
expirationreminderai/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # NestJS REST API
│   └── worker/       # BullMQ worker for OCR & extraction
├── packages/
│   ├── database/     # Prisma schema & migrations
│   └── shared/       # Shared types & utilities
├── docker-compose.yml
└── package.json
```

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Kimi K2 API key
- SendGrid API key (or Mailgun)

## Quick Start

### 1. Clone and Install

```bash
cd /Users/norbertolibago/code/personal/expirationreminderai
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL=postgresql://expirationreminderai:expirationreminderai@localhost:5432/expirationreminderai

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kimi K2
KIMI_API_KEY=your_kimi_api_key_here
KIMI_API_ENDPOINT=https://api.moonshot.cn/v1

# OCR Provider
OCR_PROVIDER=tesseract

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_key_here
EMAIL_FROM=alerts@expirationreminderai.com
ALERT_EMAIL=your_email@example.com

# API
API_PORT=3001
API_HOST=http://localhost:3001

# Web
NEXT_PUBLIC_API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
```

### 3. Start Database & Redis

```bash
docker-compose up -d
```

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start All Services

Open 3 terminal windows:

**Terminal 1 - API:**
```bash
npm run dev:api
```

**Terminal 2 - Worker:**
```bash
npm run dev:worker
```

**Terminal 3 - Frontend:**
```bash
npm run dev:web
```

### 6. Access the Application

Open your browser to: **http://localhost:3000**

## How It Works

### 1. Upload Flow

1. User uploads a PDF contract via drag & drop
2. API creates a contract record with status `queued`
3. BullMQ queues an OCR job

### 2. OCR Processing

1. Worker picks up the OCR job
2. Converts PDF pages to images
3. Runs Tesseract OCR on each page
4. Concatenates text with page markers: `<<<PAGE 1>>> ... <<<PAGE 2>>> ...`
5. Saves to `contract_text` table
6. Queues extraction job

### 3. AI Extraction

1. Worker picks up the extraction job
2. Chunks long text (max 12,000 chars per chunk)
3. Sends each chunk to Kimi K2 with structured extraction prompt
4. Merges results using these rules:
   - **vendor_name:** first non-null mention
   - **contract_end_date:** earliest date found
   - **notice_period_days:** largest value
   - **auto_renews:** true if ANY chunk indicates auto-renewal
5. Updates contract record with extracted fields
6. Sets status to `ready`

### 4. Dashboard

1. Calculates urgency for each contract:
   ```
   days_left_to_cancel = (end_date - today) - notice_days
   ```
2. Sorts by `days_left_to_cancel` (ascending)
3. Shows status badges:
   - 🔴 **In Window** (≤ 0 days)
   - 🟡 **Approaching** (1-30 days)
   - 🟢 **Safe** (> 30 days)
   - ⚪ **Needs Review** (missing data)

### 5. Email Alerts

1. Cron job runs daily at 09:00 Asia/Manila
2. Checks all contracts with `end_date` and `notice_days`
3. Sends alerts when:
   - `days_left_to_cancel == 30` (warning)
   - `days_left_to_cancel == 7` (urgent)
   - `days_left_to_cancel <= 0` (critical)
4. Updates `last_alerted_on` to prevent duplicate emails

## Database Schema

### contracts

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| original_filename | TEXT | Uploaded PDF filename |
| vendor | TEXT | Vendor/counterparty name |
| end_date | DATE | Contract end/expiration date |
| notice_days | INTEGER | Notice period in days |
| auto_renews | BOOLEAN | Whether contract auto-renews |
| status | TEXT | `queued`, `processing`, `ready`, `failed` |
| error_message | TEXT | Error details if failed |
| last_alerted_on | DATE | Last email alert date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### contract_text

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contract_id | UUID | Foreign key to contracts |
| full_text | TEXT | OCR extracted text with page markers |
| created_at | TIMESTAMP | Creation timestamp |

## API Endpoints

### POST /contracts/upload
Upload a PDF contract.

**Request:**
- `file`: PDF file (multipart/form-data)

**Response:**
```json
{
  "id": "uuid",
  "originalFilename": "contract.pdf",
  "status": "queued",
  "createdAt": "2026-01-30T00:00:00Z"
}
```

### GET /contracts/:id
Get contract details.

**Response:**
```json
{
  "id": "uuid",
  "vendor": "Acme Corp",
  "endDate": "2026-12-31",
  "noticeDays": 30,
  "autoRenews": true,
  "status": "ready"
}
```

### PATCH /contracts/:id
Update contract fields.

**Request:**
```json
{
  "vendor": "Acme Corp",
  "endDate": "2026-12-31",
  "noticeDays": 30,
  "autoRenews": true
}
```

### GET /contracts
Get all contracts for dashboard (sorted by urgency).

**Response:**
```json
[
  {
    "id": "uuid",
    "vendor": "Acme Corp",
    "endDate": "2026-12-31",
    "noticeDays": 30,
    "autoRenews": true,
    "status": "ready",
    "daysLeftToCancel": 15,
    "urgencyStatus": "approaching"
  }
]
```

## Development

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Open Prisma Studio
cd packages/database && npm run studio
```

### Debugging

- API logs: Check terminal running `npm run dev:api`
- Worker logs: Check terminal running `npm run dev:worker`
- Database: Use Prisma Studio or connect directly to PostgreSQL

## Production Deployment

### Environment Variables

Set these in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` / `REDIS_PORT` - Redis connection
- `KIMI_API_KEY` - Kimi K2 API key
- `SENDGRID_API_KEY` - SendGrid API key
- `EMAIL_FROM` - Sender email address
- `ALERT_EMAIL` - Recipient email for alerts
- `API_HOST` - Public API URL
- `NEXT_PUBLIC_API_URL` - API URL for frontend
- `WEB_URL` - Public frontend URL

### Build Commands

```bash
# Build all apps
npm run build

# Start production servers
npm run start --workspace=apps/api
npm run start --workspace=apps/worker
npm run start --workspace=apps/web
```

## Known Limitations (MVP)

1. **OCR Rendering:** PDF-to-image conversion is simplified. For production, use `pdf2pic` or Ghostscript.
2. **Single User:** No authentication or multi-tenancy.
3. **Email Recipient:** Hardcoded in environment variable.
4. **No File Storage:** PDFs stored locally. Use S3 for production.
5. **No Retry Logic:** Failed jobs are not automatically retried.

## Roadmap (Post-MVP)

- [ ] User authentication & multi-tenancy
- [ ] S3 file storage
- [ ] Advanced OCR with Google Vision or Azure
- [ ] Retry logic for failed jobs
- [ ] Webhook notifications
- [ ] Mobile app
- [ ] Bulk upload
- [ ] Contract templates

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for contract renewal tracking**
