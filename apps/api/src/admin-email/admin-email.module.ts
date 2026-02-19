import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { User } from '@expirationreminderai/database';
import { AdminEmailController } from './admin-email.controller';
import { AdminEmailService } from './admin-email.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        BullModule.registerQueue({ name: 'email-send' }),
    ],
    controllers: [AdminEmailController],
    providers: [AdminEmailService],
})
export class AdminEmailModule {}
