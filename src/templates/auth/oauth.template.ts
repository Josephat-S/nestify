export function createOAuthModuleTemplate(): string {
  return `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [ConfigModule],
  controllers: [OAuthController],
  providers: [OAuthService, GoogleStrategy],
  exports: [OAuthService],
})
export class OAuthModule {}
`;
}

export function createOAuthServiceTemplate(): string {
  return `import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface OAuthUser {
  email: string;
  name: string;
  picture?: string;
  provider: string;
  providerId: string;
}

@Injectable()
export class OAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateOAuthUser(oauthUser: OAuthUser): Promise<any> {
    // TODO: Find or create user in database
    // Example:
    // let user = await this.usersService.findByEmail(oauthUser.email);
    // if (!user) {
    //   user = await this.usersService.create({
    //     email: oauthUser.email,
    //     name: oauthUser.name,
    //     provider: oauthUser.provider,
    //     providerId: oauthUser.providerId,
    //   });
    // }
    return oauthUser;
  }

  async generateToken(user: any): Promise<{ accessToken: string }> {
    const payload = { sub: user.providerId, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
`;
}

export function createOAuthControllerTemplate(): string {
  return `import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthService } from './oauth.service';

@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req: any, @Res() res: any) {
    const token = await this.oauthService.generateToken(req.user);
    // Redirect to frontend with token
    res.redirect(\`/auth/success?token=\${token.accessToken}\`);
  }
}
`;
}

export function createGoogleStrategyTemplate(): string {
  return `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from '../oauth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OAuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.oauthService.validateOAuthUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0]?.value,
      provider: 'google',
      providerId: profile.id,
    });
    done(null, user);
  }
}
`;
}

export function createOAuthServiceSpecTemplate(): string {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { OAuthService } from './oauth.service';

describe('OAuthService', () => {
  let service: OAuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('oauth-test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthUser', () => {
    it('should return the oauth user', async () => {
      const oauthUser = {
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
        providerId: '123',
      };
      const result = await service.validateOAuthUser(oauthUser);
      expect(result).toEqual(oauthUser);
    });
  });

  describe('generateToken', () => {
    it('should return an access token', async () => {
      const user = { providerId: '123', email: 'test@example.com' };
      const result = await service.generateToken(user);
      expect(result).toEqual({ accessToken: 'oauth-test-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '123',
        email: 'test@example.com',
      });
    });
  });
});
`;
}
