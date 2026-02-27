import {
    IsString,
    IsNotEmpty,
    IsDate,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsIn,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const CATEGORIES = [
    'contract', 'license', 'insurance', 'certification',
    'permit', 'subscription', 'lease', 'registration', 'other',
] as const;

export class CreateManualDocumentDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsIn(CATEGORIES)
    category!: string;

    @IsString()
    @IsOptional()
    vendor?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    endDate?: Date;

    @IsNumber()
    @Min(0)
    @IsOptional()
    noticeDays?: number;

    @IsBoolean()
    @IsOptional()
    autoRenews?: boolean;
}
