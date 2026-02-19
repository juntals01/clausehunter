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

@Entity('feedback')
export class Feedback {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'varchar', length: 50, default: 'other' })
    category!: string; // 'bug' | 'feature' | 'question' | 'other'

    @Column({ type: 'varchar', length: 50, default: 'open' })
    status!: string; // 'open' | 'in_progress' | 'resolved' | 'closed'

    @Column({ type: 'varchar', length: 50, default: 'medium' })
    priority!: string; // 'low' | 'medium' | 'high'

    @Column({ name: 'admin_note', type: 'text', nullable: true })
    adminNote!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => User, (user) => user.feedbacks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user?: User;
}
