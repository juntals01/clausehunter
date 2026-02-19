import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@expirationreminderai/database';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
    imports: [TypeOrmModule.forFeature([Subscription])],
    controllers: [BillingController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule {}
