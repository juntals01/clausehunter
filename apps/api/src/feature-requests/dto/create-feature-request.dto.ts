import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateFeatureRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    description!: string;
}
