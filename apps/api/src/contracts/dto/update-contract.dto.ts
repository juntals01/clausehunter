import {
    IsString,
    IsNotEmpty,
    IsDate,
    IsNumber,
    IsBoolean,
    IsOptional,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContractDto {
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
