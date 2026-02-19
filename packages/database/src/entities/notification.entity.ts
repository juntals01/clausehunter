import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ type: 'varchar', length: 50 })
    type!: string; // 'contract_ready' | 'contract_failed' | 'deadline_approaching' | 'deadline_urgent' | 'welcome'

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text' })
    message!: string;

    @Column({ name: 'contract_id', type: 'uuid', nullable: true })
    contractId!: string | null;

    @Column({ name: 'read', type: 'boolean', default: false })
    read!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user?: User;
}
