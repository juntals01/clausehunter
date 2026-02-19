import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mammoth from 'mammoth';
import WordExtractor from 'word-extractor';

const VISION_API_URL = 'https://vision.googleapis.com/v1/files:annotate';
// Synchronous PDF annotation supports up to 5 pages per request
const MAX_PAGES_PER_REQUEST = 5;

@Injectable()
export class OcrService implements OnModuleInit {
    private apiKey: string;
    private wordExtractor: WordExtractor;

    constructor(private config: ConfigService) {
        this.wordExtractor = new WordExtractor();
    }

    onModuleInit() {
        this.apiKey = this.config.get<string>('GOOGLE_VISION_API_KEY', '');
        if (!this.apiKey || this.apiKey === 'your-google-vision-key-optional') {
            console.warn('[OCR] GOOGLE_VISION_API_KEY is not set — PDF OCR will not work.');
        } else {
            console.log('[OCR] Google Vision API configured ✓');
        }
    }

    /**
     * Extract text from any supported file (PDF, DOC, DOCX).
     * Detects the file type by extension and dispatches to the right parser.
     */
    async extractText(filePath: string): Promise<string> {
        const ext = path.extname(filePath).toLowerCase();

        switch (ext) {
            case '.pdf':
                return this.extractTextFromPdf(filePath);
            case '.docx':
                return this.extractTextFromDocx(filePath);
            case '.doc':
                return this.extractTextFromDoc(filePath);
            default:
                throw new Error(
                    `Unsupported file format: ${ext}. Supported formats: PDF, DOC, DOCX.`,
                );
        }
    }

    /**
     * Extract text from a .docx file using mammoth.
     */
    async extractTextFromDocx(filePath: string): Promise<string> {
        console.log(`[OCR] Extracting text from DOCX: ${path.basename(filePath)}`);

        const buffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value?.trim();

        if (!text) {
            throw new Error(
                'No text could be extracted from the DOCX file. The document may be empty.',
            );
        }

        console.log(
            `[OCR] Extracted ${text.length} characters from DOCX`,
        );

        return text;
    }

    /**
     * Extract text from a .doc (legacy binary Word) file using word-extractor.
     */
    async extractTextFromDoc(filePath: string): Promise<string> {
        console.log(`[OCR] Extracting text from DOC: ${path.basename(filePath)}`);

        const document = await this.wordExtractor.extract(filePath);
        const text = document.getBody()?.trim();

        if (!text) {
            throw new Error(
                'No text could be extracted from the DOC file. The document may be empty or corrupted.',
            );
        }

        console.log(
            `[OCR] Extracted ${text.length} characters from DOC`,
        );

        return text;
    }

    /**
     * Extract text from a PDF using Google Cloud Vision API.
     *
     * The Vision `files:annotate` endpoint accepts PDF content directly
     * (base64-encoded) and returns DOCUMENT_TEXT_DETECTION results.
     * It processes up to 5 pages per synchronous request, so for longer
     * documents we make multiple batched requests.
     */
    async extractTextFromPdf(filePath: string): Promise<string> {
        if (!this.apiKey || this.apiKey === 'your-google-vision-key-optional') {
            throw new Error(
                'Google Vision API key is not configured. Set GOOGLE_VISION_API_KEY in .env',
            );
        }

        const pdfBuffer = await fs.readFile(filePath);
        const base64Content = pdfBuffer.toString('base64');

        // Estimate page count from PDF (rough heuristic) — we'll let
        // Vision handle what it can and paginate through.
        // Start with first 5 pages, then keep requesting until no new text.
        const allPageTexts: string[] = [];
        let batchIndex = 0;
        let hasMore = true;

        while (hasMore) {
            const startPage = batchIndex * MAX_PAGES_PER_REQUEST + 1;
            const endPage = startPage + MAX_PAGES_PER_REQUEST - 1;
            const pages = Array.from(
                { length: MAX_PAGES_PER_REQUEST },
                (_, i) => startPage + i,
            );

            console.log(
                `[OCR] Requesting pages ${startPage}–${endPage} from Google Vision…`,
            );

            try {
                const response = await axios.post(
                    `${VISION_API_URL}?key=${this.apiKey}`,
                    {
                        requests: [
                            {
                                inputConfig: {
                                    content: base64Content,
                                    mimeType: 'application/pdf',
                                },
                                features: [
                                    { type: 'DOCUMENT_TEXT_DETECTION' },
                                ],
                                pages,
                            },
                        ],
                    },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 120_000, // 2 min per batch
                        maxBodyLength: 50 * 1024 * 1024, // 50 MB
                        maxContentLength: 50 * 1024 * 1024,
                    },
                );

                const responses =
                    response.data?.responses?.[0]?.responses ?? [];

                if (responses.length === 0) {
                    // No more pages
                    hasMore = false;
                    break;
                }

                for (const pageResp of responses) {
                    const text =
                        pageResp?.fullTextAnnotation?.text ?? '';
                    if (text.trim()) {
                        allPageTexts.push(text);
                    }
                }

                // If we got fewer pages than requested, we've reached the end
                if (responses.length < MAX_PAGES_PER_REQUEST) {
                    hasMore = false;
                }

                batchIndex++;

                // Safety: don't exceed 400 pages (2000 is API max)
                if (batchIndex * MAX_PAGES_PER_REQUEST >= 400) {
                    hasMore = false;
                }
            } catch (error) {
                const errData = error.response?.data?.error;
                if (errData) {
                    console.error(
                        `[OCR] Google Vision API error:`,
                        JSON.stringify(errData, null, 2),
                    );
                    // If the error is about invalid pages (beyond doc length), stop
                    if (
                        errData.message?.includes('page') ||
                        errData.code === 400
                    ) {
                        hasMore = false;
                        break;
                    }
                    throw new Error(
                        `Google Vision API error: ${errData.message ?? error.message}`,
                    );
                }
                throw new Error(
                    `Failed to call Google Vision API: ${error.message}`,
                );
            }
        }

        const fullText = allPageTexts.join('\n\n--- Page Break ---\n\n');

        if (!fullText.trim()) {
            throw new Error(
                'Google Vision returned no text. The PDF may be empty or corrupted.',
            );
        }

        console.log(
            `[OCR] Extracted ${fullText.length} characters across ${allPageTexts.length} page(s)`,
        );

        return fullText;
    }
}
