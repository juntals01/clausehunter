// ---------------------------------------------------------------------------
// Subscription / Billing
// ---------------------------------------------------------------------------

export type PlanName = 'free' | 'pro' | 'team';

export type SubscriptionStatus =
    | 'active'
    | 'cancelled'
    | 'expired'
    | 'past_due'
    | 'paused'
    | 'on_trial'
    | 'unpaid';

export const PLAN_LIMITS: Record<PlanName, number> = {
    free: 3,
    pro: Infinity,
    team: Infinity,
};

// ---------------------------------------------------------------------------
// Document Categories
// ---------------------------------------------------------------------------

export type DocumentCategory =
    | 'contract'
    | 'license'
    | 'insurance'
    | 'certification'
    | 'permit'
    | 'subscription'
    | 'lease'
    | 'registration'
    | 'other';

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, string> = {
    contract: 'Contract',
    license: 'License',
    insurance: 'Insurance',
    certification: 'Certification',
    permit: 'Permit',
    subscription: 'Subscription',
    lease: 'Lease',
    registration: 'Registration',
    other: 'Other',
};

// ---------------------------------------------------------------------------
// Contracts / Documents
// ---------------------------------------------------------------------------

export type ContractStatus = 'queued' | 'processing' | 'ready' | 'failed';

export type ClauseType = 'auto_renewal' | 'notice_period' | 'termination' | 'penalty' | 'price_escalation';
export type PenaltyType = 'early_termination_fee' | 'liquidated_damages' | 'other';
export type Confidence = 'high' | 'medium' | 'low';

export interface RenewalClause {
    clause_text: string;
    clause_type: ClauseType;
    confidence: Confidence;
}

export interface PenaltyClause {
    clause_text: string;
    penalty_type: PenaltyType;
    amount: string | null;
    confidence: Confidence;
}

export interface KeyDate {
    date: string; // YYYY-MM-DD
    label: string;
    source_text: string;
}

export interface ContractExtraction {
    document_title: string | null;
    vendor_name: string | null;
    contract_end_date: string | null; // YYYY-MM-DD
    notice_period_days: number | null;
    auto_renews: boolean | null;
    renewal_term_months: number | null;
    cancellation_deadline: string | null; // YYYY-MM-DD
    renewal_clauses: RenewalClause[];
    penalty_clauses: PenaltyClause[];
    key_dates: KeyDate[];
    summary: string | null;
}

export interface DashboardDocument {
    id: string;
    title: string | null;
    category: DocumentCategory;
    vendor: string | null;
    endDate: Date | null;
    noticeDays: number | null;
    autoRenews: boolean | null;
    status: ContractStatus;
    daysLeftToCancel: number | null;
    urgencyStatus: 'safe' | 'approaching' | 'in-window' | 'needs-review';
}

/** @deprecated Use DashboardDocument instead */
export type DashboardContract = DashboardDocument;

// ---------------------------------------------------------------------------
// AI Extraction Prompts
// Source of truth: /prompts/extract-renewals.md
// ---------------------------------------------------------------------------

export const EXTRACTION_SYSTEM_PROMPT = `You are a document analysis AI that extracts expiration dates, deadlines, and renewal information from any type of document — contracts, licenses, insurance policies, permits, certifications, leases, registrations, and subscriptions. You extract structured data with high precision. You never guess — if information is not explicitly stated, return null. You always return valid JSON and nothing else.`;

export const EXTRACTION_USER_PROMPT = `Analyze the following document text and extract the expiration/deadline information.
Return ONLY a valid JSON object with exactly these keys. Do NOT guess or infer values.
If a field is not explicitly stated in the document, use null.

Expected JSON shape:

{
  "document_title": "string | null",
  "vendor_name": "string | null",
  "contract_end_date": "YYYY-MM-DD | null",
  "notice_period_days": "integer | null",
  "auto_renews": "boolean | null",
  "renewal_term_months": "integer | null",
  "cancellation_deadline": "YYYY-MM-DD | null",
  "renewal_clauses": [
    {
      "clause_text": "string — the exact quoted text from the document",
      "clause_type": "auto_renewal | notice_period | termination | penalty | price_escalation",
      "confidence": "high | medium | low"
    }
  ],
  "penalty_clauses": [
    {
      "clause_text": "string — the exact quoted text",
      "penalty_type": "early_termination_fee | liquidated_damages | other",
      "amount": "string | null",
      "confidence": "high | medium | low"
    }
  ],
  "key_dates": [
    {
      "date": "YYYY-MM-DD",
      "label": "string",
      "source_text": "string — the sentence where this date appears"
    }
  ],
  "summary": "string — 1-2 sentence plain-English summary of the document's expiration/deadline situation"
}

=== CRITICAL: How to pick contract_end_date when multiple dates exist ===

Documents often contain many dates. You MUST follow this priority to select the correct contract_end_date:

1. Look for these labels (highest to lowest priority):
   - "Expiration Date", "Expiry Date", "Valid Until", "Valid Through", "Expires On"
   - "End Date", "Term End Date", "Termination Date", "Coverage End"
   - "Renewal Date", "Due Date", "Maturity Date"
   - End of a stated term (e.g., "for a period of 12 months from [start date]" → compute the end)

2. NEVER use these as contract_end_date:
   - Issue date, effective date, start date, commencement date, execution date, signature date
   - Date of birth, filing date, application date, registration date
   - Payment due dates (unless the document is a single invoice with one due date)

3. When a document has BOTH a start date and a term length but no explicit end date, CALCULATE the end date:
   - Example: "Effective Date: January 1, 2025" + "Term: 24 months" → contract_end_date = "2026-12-31"

4. When there are multiple end/expiration dates (e.g., multi-year contract with phase dates), use the FINAL expiration date of the overall document/agreement.

5. Put ALL dates you find into the key_dates array so the user can review them.

=== Other Extraction Rules ===
1. document_title: A short, human-readable title for this document. Derive it from the document heading, subject line, or the type + vendor (e.g., "Office Lease Agreement", "Business License", "Auto Insurance Policy — State Farm"). Keep it concise (under 60 characters). If you truly cannot determine a title, return null.
2. vendor_name: The counterparty, issuing authority, provider, or organization — NOT the customer/holder. For licenses, this is the issuing body. For insurance, this is the insurer.
3. notice_period_days: Days of written notice required to prevent renewal or to terminate/cancel.
4. auto_renews: true ONLY when text explicitly states automatic renewal.
5. renewal_term_months: Duration of each renewal period in months.
6. cancellation_deadline: contract_end_date minus notice_period_days. Only compute if both are available.
7. renewal_clauses: EXACT text of each renewal-related clause with type and confidence.
8. penalty_clauses: Early termination fees, penalties, or late fees with amounts.
9. key_dates: ALL dates found in the document — include issue dates, start dates, end dates, payment dates, etc. Label each clearly.
10. summary: Plain-English summary of the expiration/renewal situation.

Important:
- Return ONLY the JSON object. No markdown, no commentary.
- All dates in YYYY-MM-DD format.
- If no expiration or deadline info found, return all fields as null, empty arrays, and summary "No expiration or deadline information found."
- Preserve exact clause text — do not paraphrase.

Document text:
`;

// Keep the old simple prompt for backward compat
export const EXTRACTION_PROMPT = EXTRACTION_USER_PROMPT;
