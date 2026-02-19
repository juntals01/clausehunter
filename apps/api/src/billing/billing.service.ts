import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '@expirationreminderai/database';
import { PlanName } from '@expirationreminderai/shared';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private readonly apiKey: string;
    private readonly storeId: string;
    private readonly baseUrl = 'https://api.lemonsqueezy.com/v1';

    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
        private config: ConfigService,
    ) {
        this.apiKey = this.config.get('LEMONSQUEEZY_API_KEY', '');
        this.storeId = this.config.get('LEMONSQUEEZY_STORE_ID', '');
    }

    async createCheckout(userId: string, email: string, variantId: string, planName: PlanName) {
        const webUrl = this.config.get('WEB_URL', 'http://localhost:3000');

        const res = await fetch(`${this.baseUrl}/checkouts`, {
            method: 'POST',
            headers: {
                Accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        checkout_data: {
                            email,
                            custom: { user_id: userId },
                        },
                        product_options: {
                            redirect_url: `${webUrl}/billing?checkout=success`,
                        },
                    },
                    relationships: {
                        store: { data: { type: 'stores', id: this.storeId } },
                        variant: { data: { type: 'variants', id: variantId } },
                    },
                },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            this.logger.error(`LemonSqueezy checkout error: ${err}`);
            throw new Error('Failed to create checkout');
        }

        const json = await res.json();
        return { checkoutUrl: json.data.attributes.url };
    }

    async handleWebhookEvent(eventName: string, data: any, meta: any) {
        this.logger.log(`Webhook received: ${eventName}`);

        const attrs = data.attributes;
        const lsSubscriptionId = String(data.id);
        const userId = meta?.custom_data?.user_id;

        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated':
            case 'subscription_resumed': {
                if (!userId && eventName === 'subscription_created') {
                    this.logger.warn(`No user_id in custom_data for ${eventName}`);
                    return;
                }

                const variantId = String(attrs.variant_id);
                const planName = this.variantToPlan(variantId);

                let subscription = await this.subscriptionRepository.findOne({
                    where: { lsSubscriptionId },
                });

                const subData: Partial<Subscription> = {
                    lsSubscriptionId,
                    lsCustomerId: attrs.customer_id ? String(attrs.customer_id) : null,
                    lsOrderId: attrs.order_id ? String(attrs.order_id) : null,
                    productId: attrs.product_id ? String(attrs.product_id) : null,
                    variantId,
                    status: attrs.status,
                    planName,
                    cardBrand: attrs.card_brand || null,
                    cardLastFour: attrs.card_last_four || null,
                    trialEndsAt: attrs.trial_ends_at ? new Date(attrs.trial_ends_at) : null,
                    renewsAt: attrs.renews_at ? new Date(attrs.renews_at) : null,
                    endsAt: attrs.ends_at ? new Date(attrs.ends_at) : null,
                    updatePaymentMethodUrl: attrs.urls?.update_payment_method || null,
                };

                if (subscription) {
                    await this.subscriptionRepository.update(subscription.id, subData);
                } else {
                    subscription = this.subscriptionRepository.create({
                        ...subData,
                        userId: userId!,
                    });
                    await this.subscriptionRepository.save(subscription);
                }

                this.logger.log(
                    `Subscription ${eventName}: ${lsSubscriptionId} → ${planName} (${attrs.status})`,
                );
                break;
            }

            case 'subscription_cancelled':
            case 'subscription_expired': {
                await this.subscriptionRepository.update(
                    { lsSubscriptionId },
                    {
                        status: attrs.status,
                        endsAt: attrs.ends_at ? new Date(attrs.ends_at) : null,
                    },
                );
                this.logger.log(`Subscription ${eventName}: ${lsSubscriptionId}`);
                break;
            }

            case 'subscription_payment_failed': {
                await this.subscriptionRepository.update(
                    { lsSubscriptionId },
                    { status: 'past_due' },
                );
                this.logger.log(`Subscription payment failed: ${lsSubscriptionId}`);
                break;
            }

            case 'subscription_payment_success':
            case 'subscription_payment_recovered': {
                await this.subscriptionRepository.update(
                    { lsSubscriptionId },
                    { status: 'active' },
                );
                this.logger.log(`Subscription payment success: ${lsSubscriptionId}`);
                break;
            }

            default:
                this.logger.log(`Unhandled event: ${eventName}`);
        }
    }

    async getSubscription(userId: string) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        if (!subscription || subscription.status === 'expired') {
            return {
                plan: 'free' as PlanName,
                status: 'active',
                subscription: null,
            };
        }

        return {
            plan: subscription.planName as PlanName,
            status: subscription.status,
            subscription: {
                id: subscription.id,
                lsSubscriptionId: subscription.lsSubscriptionId,
                planName: subscription.planName,
                status: subscription.status,
                cardBrand: subscription.cardBrand,
                cardLastFour: subscription.cardLastFour,
                renewsAt: subscription.renewsAt,
                endsAt: subscription.endsAt,
                trialEndsAt: subscription.trialEndsAt,
                updatePaymentMethodUrl: subscription.updatePaymentMethodUrl,
                createdAt: subscription.createdAt,
            },
        };
    }

    async getUserPlan(userId: string): Promise<PlanName> {
        const sub = await this.subscriptionRepository.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        if (!sub || sub.status === 'expired' || sub.status === 'cancelled') {
            if (sub?.status === 'cancelled' && sub.endsAt && new Date(sub.endsAt) > new Date()) {
                return sub.planName as PlanName;
            }
            return 'free';
        }

        return sub.planName as PlanName;
    }

    private variantToPlan(variantId: string): PlanName {
        const proVariant = this.config.get('LEMONSQUEEZY_VARIANT_ID_PRO', '');
        const teamVariant = this.config.get('LEMONSQUEEZY_VARIANT_ID_TEAM', '');

        if (variantId === proVariant) return 'pro';
        if (variantId === teamVariant) return 'team';
        return 'pro'; // default to pro for unknown variants
    }
}
