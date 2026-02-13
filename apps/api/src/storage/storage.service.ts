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

        this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                console.log(`✓ Created MinIO bucket: ${this.bucketName}`);
            }
        } catch (error) {
            console.error('Error ensuring bucket exists:', error);
        }
    }

    async uploadFile(
        fileName: string,
        fileBuffer: Buffer,
        contentType: string,
    ): Promise<string> {
        try {
            await this.minioClient.putObject(
                this.bucketName,
                fileName,
                fileBuffer,
                fileBuffer.length,
                { 'Content-Type': contentType },
            );
            return fileName;
        } catch (error) {
            throw new Error(`Failed to upload file to MinIO: ${error.message}`);
        }
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

    async deleteFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
        } catch (error) {
            throw new Error(`Failed to delete file from MinIO: ${error.message}`);
        }
    }

    async getFileUrl(fileName: string, expirySeconds: number = 3600): Promise<string> {
        try {
            return await this.minioClient.presignedGetObject(
                this.bucketName,
                fileName,
                expirySeconds,
            );
        } catch (error) {
            throw new Error(`Failed to generate file URL: ${error.message}`);
        }
    }
}
