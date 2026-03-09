import {
    IsString,
    IsDateString,
    IsNumber,
    IsOptional,
    IsIn,
    Min,
} from 'class-validator';

export class UpdateContractItemDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    expiryDate?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    noticeDays?: number;

    @IsString()
    @IsIn(['active', 'expired', 'resolved'])
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    sourceText?: string;
}
