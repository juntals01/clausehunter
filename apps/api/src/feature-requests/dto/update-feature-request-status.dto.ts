import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateFeatureRequestStatusDto {
    @IsOptional()
    @IsString()
    @IsIn(['open', 'planned', 'in_progress', 'completed', 'closed'])
    status?: string;

    @IsOptional()
    @IsString()
    adminResponse?: string;
}
