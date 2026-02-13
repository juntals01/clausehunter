import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Contract } from './contract.entity';

@Entity('contract_text')
export class ContractText {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'contract_id', type: 'uuid' })
    contractId!: string;

    @Column({ name: 'full_text', type: 'text' })
    fullText!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @OneToOne(() => Contract, (contract) => contract.contractText, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'contract_id' })
    contract!: Contract;
}
