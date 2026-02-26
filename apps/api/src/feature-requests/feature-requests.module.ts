import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { FeatureRequest, FeatureRequestVote } from '@expirationreminderai/database';
import { FeatureRequestsService } from './feature-requests.service';
import { FeatureRequestsController } from './feature-requests.controller';
import { AdminFeatureRequestsController } from './admin-feature-requests.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([FeatureRequest, FeatureRequestVote]),
        JwtModule.register({}),
    ],
    controllers: [FeatureRequestsController, AdminFeatureRequestsController],
    providers: [FeatureRequestsService],
    exports: [FeatureRequestsService],
})
export class FeatureRequestsModule {}
