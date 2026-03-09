import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Contract } from './contract.entity';

@Entity('contract_items')
export class ContractItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'contract_id', type: 'uuid' })
    contractId!: string;

    @Column({ type: 'text' })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ name: 'expiry_date', type: 'date', nullable: true })
    expiryDate!: Date | null;

    @Column({ name: 'notice_days', type: 'integer', nullable: true })
    noticeDays!: number | null;

    @Column({ type: 'text', default: 'active' })
    status!: string; // 'active' | 'expired' | 'resolved'

    @Column({ name: 'source_text', type: 'text', nullable: true })
    sourceText!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => Contract, (contract) => contract.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'contract_id' })
    contract?: Contract;
}
