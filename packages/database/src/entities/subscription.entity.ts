import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'ls_customer_id', type: 'varchar', length: 255, nullable: true })
    lsCustomerId!: string | null;

    @Column({ name: 'ls_subscription_id', type: 'varchar', length: 255, unique: true })
    lsSubscriptionId!: string;

    @Column({ name: 'ls_order_id', type: 'varchar', length: 255, nullable: true })
    lsOrderId!: string | null;

    @Column({ name: 'product_id', type: 'varchar', length: 255, nullable: true })
    productId!: string | null;

    @Column({ name: 'variant_id', type: 'varchar', length: 255, nullable: true })
    variantId!: string | null;

    @Column({ type: 'varchar', length: 50, default: 'active' })
    status!: string;

    @Column({ name: 'plan_name', type: 'varchar', length: 50, default: 'free' })
    planName!: string;

    @Column({ name: 'card_brand', type: 'varchar', length: 50, nullable: true })
    cardBrand!: string | null;

    @Column({ name: 'card_last_four', type: 'varchar', length: 4, nullable: true })
    cardLastFour!: string | null;

    @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
    trialEndsAt!: Date | null;

    @Column({ name: 'renews_at', type: 'timestamp', nullable: true })
    renewsAt!: Date | null;

    @Column({ name: 'ends_at', type: 'timestamp', nullable: true })
    endsAt!: Date | null;

    @Column({ name: 'update_payment_method_url', type: 'text', nullable: true })
    updatePaymentMethodUrl!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user?: User;
}
