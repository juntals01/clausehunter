import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateFeedbackStatusDto {
    @IsOptional()
    @IsString()
    @IsIn(['open', 'in_progress', 'resolved', 'closed'])
    status?: string;

    @IsOptional()
    @IsString()
    adminNote?: string;
}
