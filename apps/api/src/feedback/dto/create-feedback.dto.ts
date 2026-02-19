import { IsString, IsNotEmpty, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateFeedbackDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    description!: string;

    @IsOptional()
    @IsString()
    @IsIn(['bug', 'feature', 'question', 'other'])
    category?: string;

    @IsOptional()
    @IsString()
    @IsIn(['low', 'medium', 'high'])
    priority?: string;
}
