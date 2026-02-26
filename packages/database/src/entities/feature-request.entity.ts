import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FeatureRequestVote } from './feature-request-vote.entity';

@Entity('feature_requests')
export class FeatureRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'varchar', length: 50, default: 'open' })
    status!: string; // 'open' | 'planned' | 'in_progress' | 'completed' | 'closed'

    @Column({ name: 'vote_count', type: 'int', default: 0 })
    voteCount!: number;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'admin_response', type: 'text', nullable: true })
    adminResponse!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @OneToMany(() => FeatureRequestVote, (vote) => vote.featureRequest)
    votes?: FeatureRequestVote[];
}
