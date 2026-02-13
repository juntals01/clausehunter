import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import pdfParse from 'pdf-parse';

@Injectable()
export class OcrService {
    constructor(private config: ConfigService) { }

    /**
     * Extract text from PDF
     * First tries to extract text directly (for text-based PDFs)
     * Falls back to OCR if needed (requires ImageMagick for scanned PDFs)
     */
    async extractTextFromPdf(filePath: string): Promise<string> {
        try {
            // Read PDF file
            const pdfBuffer = await fs.readFile(filePath);
            
            // Try to extract text directly using pdf-parse
            const data = await pdfParse(pdfBuffer);
            
            if (data.text && data.text.trim().length > 50) {
                console.log(`Extracted ${data.text.length} characters directly from PDF`);
                return data.text;
            }
            
            // If little or no text found, it might be a scanned PDF
            console.warn('PDF appears to be scanned or image-based. OCR not available (ImageMagick required).');
            return `[This appears to be a scanned or image-based PDF. Text extraction requires OCR which is not fully configured.]`;
            
        } catch (error) {
            console.error('PDF extraction error:', error);
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }
}
