import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ContactDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    subject: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    message: string;
}
