import {
    IsString,
    IsDateString,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';

export class CreateContractItemDto {
    @IsString()
    name!: string;

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
    @IsOptional()
    sourceText?: string;
}
