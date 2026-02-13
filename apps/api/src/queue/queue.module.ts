import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    host: config.get('REDIS_HOST', 'localhost'),
                    port: config.get('REDIS_PORT', 6379),
                },
            }),
        }),
        BullModule.registerQueue(
            { name: 'contract-ocr' },
            { name: 'contract-extract' },
            { name: 'email-alerts' },
        ),
    ],
    exports: [BullModule],
})
export class QueueModule { }
