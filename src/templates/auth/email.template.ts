export function createEmailModuleTemplate(): string {
  return `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
`;
}

export function createEmailServiceTemplate(): string {
  return `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const verificationUrl = \`\${appUrl}/auth/verify?token=\${token}\`;

    // TODO: Integrate with email provider (e.g., nodemailer, SendGrid)
    console.log(\`Verification email sent to \${email}\`);
    console.log(\`Verification URL: \${verificationUrl}\`);
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const resetUrl = \`\${appUrl}/auth/reset-password?token=\${token}\`;

    // TODO: Integrate with email provider
    console.log(\`Password reset email sent to \${email}\`);
    console.log(\`Reset URL: \${resetUrl}\`);
  }
}
`;
}
