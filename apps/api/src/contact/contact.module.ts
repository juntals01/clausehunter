import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'email-send' }),
    ],
    controllers: [ContactController],
    providers: [ContactService],
})
export class ContactModule {}
