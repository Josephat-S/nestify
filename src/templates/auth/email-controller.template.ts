export function createEmailControllerTemplate(): string {
  return `import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('auth')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    // TODO: Validate token and mark email as verified
    return { message: 'Email verified successfully' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    // TODO: Generate reset token and store it
    const token = 'generated-reset-token';
    await this.emailService.sendPasswordResetEmail(body.email, token);
    return { message: 'Password reset email sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { token: string; password: string },
  ) {
    // TODO: Validate token and update password
    return { message: 'Password reset successfully' };
  }
}
`;
}
