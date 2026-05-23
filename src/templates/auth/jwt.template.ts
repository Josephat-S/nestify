export function createJwtAuthModuleTemplate(): string {
  return `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
`;
}

export function createJwtAuthServiceTemplate(): string {
  return `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Replace with actual user lookup and password comparison
    // Example: const user = await this.usersService.findByEmail(email);
    // if (user && await bcrypt.compare(password, user.password)) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any): Promise<{ accessToken: string }> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    // TODO: Replace with actual user creation logic
    // Example: const user = await this.usersService.create(registerDto);
    const payload: JwtPayload = { sub: 'user-id', email: registerDto.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
`;
}

export function createJwtAuthControllerTemplate(): string {
  return `import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService, LoginDto, RegisterDto } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
`;
}

export function createJwtStrategyTemplate(): string {
  return `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
`;
}

export function createLocalStrategyTemplate(): string {
  return `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
`;
}

export function createJwtAuthGuardTemplate(): string {
  return `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
`;
}

export function createLocalAuthGuardTemplate(): string {
  return `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
`;
}

export function createJwtAuthServiceSpecTemplate(): string {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const result = await service.login(user);
      expect(result).toEqual({ accessToken: 'test-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
      });
    });
  });

  describe('register', () => {
    it('should return an access token', async () => {
      const dto = { email: 'test@example.com', password: 'pass', name: 'Test' };
      const result = await service.register(dto);
      expect(result).toEqual({ accessToken: 'test-token' });
    });
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      await expect(
        service.validateUser('test@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
`;
}

export function createJwtAuthControllerSpecTemplate(): string {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ accessToken: 'test-token' }),
            register: jest.fn().mockResolvedValue({ accessToken: 'test-token' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const req = { user: { id: '1', email: 'test@example.com' } };
      const result = await controller.login(req);
      expect(result).toEqual({ accessToken: 'test-token' });
    });
  });

  describe('register', () => {
    it('should return an access token', async () => {
      const dto = { email: 'test@example.com', password: 'pass', name: 'Test' };
      const result = await controller.register(dto);
      expect(result).toEqual({ accessToken: 'test-token' });
    });
  });

  describe('getProfile', () => {
    it('should return the user from request', () => {
      const req = { user: { id: '1', email: 'test@example.com' } };
      expect(controller.getProfile(req)).toEqual(req.user);
    });
  });
});
`;
}
