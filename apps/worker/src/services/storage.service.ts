import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
    private minioClient: Client;
    private readonly bucketName = 'contracts';

    constructor(private configService: ConfigService) {
        this.minioClient = new Client({
            endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
            port: parseInt(this.configService.get('MINIO_PORT') || '9000'),
            useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
            accessKey: this.configService.get('MINIO_ACCESS_KEY') || 'minioadmin',
            secretKey: this.configService.get('MINIO_SECRET_KEY') || 'minioadmin',
        });
    }

    async downloadFile(fileName: string): Promise<Buffer> {
        try {
            const stream = await this.minioClient.getObject(this.bucketName, fileName);
            const chunks: Buffer[] = [];

            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Failed to download file from MinIO: ${error.message}`);
        }
    }

    // Helper to save temporary file for Tesseract (if needed)
    // But standard tesseract.js can work with buffers too, checking OcrService...
}
