import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    currentPassword?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    newPassword?: string;
}
