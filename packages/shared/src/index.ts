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

export interface DashboardContract {
    id: string;
    vendor: string | null;
    endDate: Date | null;
    noticeDays: number | null;
    autoRenews: boolean | null;
    status: ContractStatus;
    daysLeftToCancel: number | null;
    urgencyStatus: 'safe' | 'approaching' | 'in-window' | 'needs-review';
}

// ---------------------------------------------------------------------------
// AI Extraction Prompts
// Source of truth: /prompts/extract-renewals.md
// ---------------------------------------------------------------------------

export const EXTRACTION_SYSTEM_PROMPT = `You are a contract analyst AI specializing in renewal clause extraction. Your job is to read contract text and extract structured renewal data with high precision. You never guess — if information is not explicitly stated in the contract, return null for that field. You always return valid JSON and nothing else.`;

export const EXTRACTION_USER_PROMPT = `Analyze the following contract text and extract all renewal-related information.
Return ONLY a valid JSON object with exactly these keys. Do NOT guess or infer values.
If a field is not explicitly stated in the contract text, use null.

Expected JSON shape:

{
  "vendor_name": "string | null",
  "contract_end_date": "YYYY-MM-DD | null",
  "notice_period_days": "integer | null",
  "auto_renews": "boolean | null",
  "renewal_term_months": "integer | null",
  "cancellation_deadline": "YYYY-MM-DD | null",
  "renewal_clauses": [
    {
      "clause_text": "string — the exact quoted text from the contract",
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
  "summary": "string — 1-2 sentence plain-English summary of the renewal situation"
}

Extraction Rules:
1. vendor_name: The counterparty (vendor/landlord/provider), NOT the customer.
2. contract_end_date: Explicit end/expiration/term end date in YYYY-MM-DD.
3. notice_period_days: Days of written notice required to prevent renewal or terminate.
4. auto_renews: true ONLY when text explicitly states automatic renewal unless notice is given.
5. renewal_term_months: Duration of each renewal period in months.
6. cancellation_deadline: contract_end_date minus notice_period_days. Only if both are available.
7. renewal_clauses: EXACT text of each renewal-related clause with type and confidence.
8. penalty_clauses: Early termination fees or penalties with amounts.
9. key_dates: All renewal-relevant dates with surrounding sentence as source_text.
10. summary: Plain-English summary of the renewal situation.

Important:
- Return ONLY the JSON object. No markdown, no commentary.
- All dates in YYYY-MM-DD format.
- If no renewal info found, return all fields as null, empty arrays, and summary "No renewal information found."
- Preserve exact clause text — do not paraphrase.

Contract text:
`;

// Keep the old simple prompt for backward compat
export const EXTRACTION_PROMPT = EXTRACTION_USER_PROMPT;
