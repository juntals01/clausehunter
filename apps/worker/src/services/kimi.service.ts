import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
    ContractExtraction,
    EXTRACTION_SYSTEM_PROMPT,
    EXTRACTION_USER_PROMPT,
} from '@expirationreminderai/shared';

const MAX_CONTRACT_TEXT_LENGTH = 15_000;
const GEMINI_OPENAI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';

/**
 * AI extraction service using Google Gemini (OpenAI-compatible endpoint).
 * Uses GEMINI_API_KEY from .env (same key can be used for Vision + Gemini).
 */
@Injectable()
export class KimiService implements OnModuleInit {
    private apiKey: string;
    private model: string;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
        this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-2.0-flash');

        if (!this.apiKey) {
            console.warn('[AI Extraction] GEMINI_API_KEY is not set — contract extraction will not work.');
        } else {
            console.log(`[AI Extraction] Google Gemini configured ✓ (model: ${this.model})`);
        }
    }

    async extractContractData(text: string): Promise<ContractExtraction> {
        if (!this.apiKey) {
            throw new Error(
                'GEMINI_API_KEY is not configured. Set it in your .env file.',
            );
        }

        const truncatedText = text.substring(0, MAX_CONTRACT_TEXT_LENGTH);
        const userPrompt = EXTRACTION_USER_PROMPT + truncatedText;

        try {
            const response = await axios.post(
                `${GEMINI_OPENAI_URL}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: EXTRACTION_SYSTEM_PROMPT,
                        },
                        {
                            role: 'user',
                            content: userPrompt,
                        },
                    ],
                    temperature: 0.1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 60_000,
                },
            );

            const content = response.data.choices[0].message.content;
            return this.parseResponse(content);
        } catch (error) {
            console.error(
                '[AI Extraction] Gemini API Error:',
                error.response?.data || error.message,
            );
            throw error;
        }
    }

    private parseResponse(content: string): ContractExtraction {
        try {
            // Strip markdown code blocks if present
            const jsonStr = content
                .replace(/```json\n?/g, '')
                .replace(/\n?```/g, '')
                .trim();
            const parsed = JSON.parse(jsonStr);

            // Ensure arrays exist even if AI omits them
            return {
                document_title: parsed.document_title ?? null,
                vendor_name: parsed.vendor_name ?? null,
                contract_end_date: parsed.contract_end_date ?? null,
                notice_period_days: parsed.notice_period_days ?? null,
                auto_renews: parsed.auto_renews ?? null,
                renewal_term_months: parsed.renewal_term_months ?? null,
                cancellation_deadline: parsed.cancellation_deadline ?? null,
                renewal_clauses: Array.isArray(parsed.renewal_clauses)
                    ? parsed.renewal_clauses
                    : [],
                penalty_clauses: Array.isArray(parsed.penalty_clauses)
                    ? parsed.penalty_clauses
                    : [],
                key_dates: Array.isArray(parsed.key_dates)
                    ? parsed.key_dates
                    : [],
                summary: parsed.summary ?? null,
            };
        } catch (e) {
            console.warn('[AI Extraction] Failed to parse JSON response:', content);
            throw new Error('Invalid JSON response from Gemini');
        }
    }
}
