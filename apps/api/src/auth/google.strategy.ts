import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID', ''),
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET', ''),
            callbackURL: `${configService.get('API_HOST', 'http://localhost:3001')}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        const { id, emails, displayName } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
            done(new Error('No email found in Google profile'), undefined);
            return;
        }

        const result = await this.authService.findOrCreateGoogleUser(
            id,
            email,
            displayName || email.split('@')[0],
        );

        done(null, result);
    }
}
