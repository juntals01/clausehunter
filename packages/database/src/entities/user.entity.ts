import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Contract } from './contract.entity';
import { Feedback } from './feedback.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
    passwordHash!: string | null;

    @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true, unique: true })
    googleId!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatar!: string | null;

    @Column({ type: 'varchar', length: 50, default: 'user' })
    role!: string; // 'admin' | 'user' | 'editor'

    @Column({ type: 'varchar', length: 50, default: 'active' })
    status!: string; // 'active' | 'inactive'

    @Column({ type: 'varchar', length: 255, nullable: true })
    company!: string | null;

    @Column({ name: 'last_active_at', type: 'timestamp', nullable: true })
    lastActiveAt!: Date | null;

    @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
    resetToken!: string | null;

    @Column({ name: 'reset_token_expires', type: 'timestamp', nullable: true })
    resetTokenExpires!: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => Contract, (contract) => contract.user)
    contracts?: Contract[];

    @OneToMany(() => Feedback, (feedback) => feedback.user)
    feedbacks?: Feedback[];
}
