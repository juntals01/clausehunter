import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ContractText } from './contract-text.entity';
import { User } from './user.entity';

@Entity('contracts')
export class Contract {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId!: string | null;

    @Column({ name: 'original_filename', type: 'text' })
    originalFilename!: string;

    @Column({ name: 'stored_filename', type: 'text', nullable: true })
    storedFilename!: string | null;

    @Column({ type: 'text', nullable: true })
    vendor!: string | null;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate!: Date | null;

    @Column({ name: 'notice_days', type: 'integer', nullable: true })
    noticeDays!: number | null;

    @Column({ name: 'auto_renews', type: 'boolean', nullable: true })
    autoRenews!: boolean | null;

    @Column({ type: 'text' })
    status!: string; // 'queued' | 'processing' | 'ready' | 'failed'

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage!: string | null;

    @Column({ name: 'extraction_data', type: 'jsonb', nullable: true })
    extractionData!: Record<string, any> | null;

    @Column({ name: 'last_alerted_on', type: 'date', nullable: true })
    lastAlertedOn!: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => User, (user) => user.contracts, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @OneToOne(() => ContractText, (contractText) => contractText.contract, {
        cascade: true,
    })
    contractText?: ContractText;
}
