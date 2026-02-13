import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { KimiService } from './kimi.service';
import { EmailService } from './email.service';
import { StorageService } from './storage.service';

@Module({
    providers: [OcrService, KimiService, EmailService, StorageService],
    exports: [OcrService, KimiService, EmailService, StorageService],
})
export class ServicesModule { }
