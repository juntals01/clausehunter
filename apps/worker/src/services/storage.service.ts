import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private minioClient: Client;
    private readonly bucketName = 'contracts';

    constructor(private configService: ConfigService) {
        const endPoint = this.configService.get('MINIO_ENDPOINT') || 'localhost';
        const port = parseInt(this.configService.get('MINIO_PORT') || '9000');
        const useSSL = this.configService.get('MINIO_USE_SSL') === 'true';
        const accessKey = this.configService.get('MINIO_ACCESS_KEY') || 'minioadmin';

        this.logger.log(`MinIO config: endpoint=${endPoint}, port=${port}, ssl=${useSSL}, accessKey=${accessKey ? '***set***' : '***EMPTY***'}`);

        this.minioClient = new Client({
            endPoint,
            port,
            useSSL,
            accessKey,
            secretKey: this.configService.get('MINIO_SECRET_KEY') || 'minioadmin',
        });
    }

    async downloadFile(fileName: string): Promise<Buffer> {
        this.logger.log(`Downloading ${fileName}`);
        try {
            const stream = await this.minioClient.getObject(this.bucketName, fileName);
            const chunks: Buffer[] = [];

            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    this.logger.log(`Download complete: ${fileName} (${buffer.length} bytes)`);
                    resolve(buffer);
                });
                stream.on('error', reject);
            });
        } catch (error) {
            this.logger.error(`Download failed for ${fileName}: ${error.message}`, error.stack);
            throw new Error(`Failed to download file from MinIO: ${error.message}`);
        }
    }
}
