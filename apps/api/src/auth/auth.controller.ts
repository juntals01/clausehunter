import { Controller, Post, Get, Body, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async getMe(@Request() req: any) {
        const user = await this.authService.validateUser(req.user.id);
        if (!user) return req.user;
        return this.authService.sanitizeUser(user);
    }

    // ─── Google OAuth ────────────────────────────────────────────────

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {
        // Passport redirects to Google — this method body is never executed
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthCallback(@Request() req: any, @Res() res: Response) {
        // req.user is set by GoogleStrategy.validate()
        const { access_token, user } = req.user;
        const webUrl = this.configService.get('WEB_URL', 'http://localhost:3000');

        // Redirect to frontend callback page with token + user data
        const params = new URLSearchParams({
            token: access_token,
            user: JSON.stringify(user),
        });

        res.redirect(`${webUrl}/auth/google/callback?${params.toString()}`);
    }
}
