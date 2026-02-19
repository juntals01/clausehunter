import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
    RawBodyRequest,
    Req,
    HttpException,
    HttpStatus,
    Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { BillingService } from './billing.service';
import { PlanName } from '@expirationreminderai/shared';

@Controller('billing')
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        private readonly config: ConfigService,
    ) {}

    @Post('checkout')
    @UseGuards(AuthGuard('jwt'))
    async createCheckout(
        @Body() body: { variantId: string; planName: PlanName },
        @Request() req: any,
    ) {
        if (!body.variantId || !body.planName) {
            throw new HttpException('variantId and planName are required', HttpStatus.BAD_REQUEST);
        }

        return this.billingService.createCheckout(
            req.user.id,
            req.user.email,
            body.variantId,
            body.planName,
        );
    }

    @Post('webhook')
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('x-signature') signature: string,
    ) {
        const secret = this.config.get('LEMONSQUEEZY_WEBHOOK_SECRET', '');

        if (!signature || !secret) {
            throw new HttpException('Missing signature or webhook secret', HttpStatus.UNAUTHORIZED);
        }

        const rawBody = req.rawBody;
        if (!rawBody) {
            throw new HttpException('Missing raw body', HttpStatus.BAD_REQUEST);
        }

        const hmac = createHmac('sha256', secret);
        hmac.update(rawBody);
        const digest = hmac.digest('hex');

        if (digest !== signature) {
            throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
        }

        const payload = JSON.parse(rawBody.toString());
        const eventName = payload.meta?.event_name;
        const data = payload.data;
        const meta = payload.meta;

        if (!eventName || !data) {
            throw new HttpException('Invalid webhook payload', HttpStatus.BAD_REQUEST);
        }

        await this.billingService.handleWebhookEvent(eventName, data, meta);

        return { received: true };
    }

    @Get('subscription')
    @UseGuards(AuthGuard('jwt'))
    async getSubscription(@Request() req: any) {
        return this.billingService.getSubscription(req.user.id);
    }
}
