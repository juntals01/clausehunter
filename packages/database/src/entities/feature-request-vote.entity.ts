import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from './user.entity';
import { FeatureRequest } from './feature-request.entity';

@Entity('feature_request_votes')
@Unique('UQ_feature_request_vote_user', ['featureRequestId', 'userId'])
export class FeatureRequestVote {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'feature_request_id', type: 'uuid' })
    featureRequestId!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @ManyToOne(() => FeatureRequest, (fr) => fr.votes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'feature_request_id' })
    featureRequest?: FeatureRequest;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user?: User;
}
