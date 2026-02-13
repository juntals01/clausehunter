import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
    ContractExtraction,
    EXTRACTION_SYSTEM_PROMPT,
    EXTRACTION_USER_PROMPT,
} from '@clausehunter/shared';

const MAX_CONTRACT_TEXT_LENGTH = 15_000;

@Injectable()
export class KimiService {
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('KIMI_API_KEY');
        this.baseUrl = this.configService.get<string>(
            'KIMI_API_ENDPOINT',
            'https://api.moonshot.cn/v1',
        );
    }

    async extractContractData(text: string): Promise<ContractExtraction> {
        const truncatedText = text.substring(0, MAX_CONTRACT_TEXT_LENGTH);
        const userPrompt = EXTRACTION_USER_PROMPT + truncatedText;

        try {
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: 'moonshot-k2',
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
                },
            );

            const content = response.data.choices[0].message.content;
            return this.parseResponse(content);
        } catch (error) {
            console.error(
                'Kimi API Error:',
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
            console.warn('Failed to parse Kimi JSON response:', content);
            throw new Error('Invalid JSON response from AI');
        }
    }
}
