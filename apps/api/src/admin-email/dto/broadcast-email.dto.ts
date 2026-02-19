import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class BroadcastEmailDto {
    @IsString()
    @IsNotEmpty()
    subject!: string;

    @IsString()
    @IsNotEmpty()
    body!: string;

    @IsOptional()
    @IsIn(['all', 'admin', 'user', 'editor'])
    targetRole?: string; // 'all' | 'admin' | 'user' | 'editor'
}
