import fs from 'fs-extra';
import path from 'path';
import { AuthFeature } from '../constants/enums';
import { AuthGenerateConfig } from '../types/project.types';
import {
  createJwtAuthModuleTemplate,
  createJwtAuthServiceTemplate,
  createJwtAuthControllerTemplate,
  createJwtStrategyTemplate,
  createLocalStrategyTemplate,
  createJwtAuthGuardTemplate,
  createLocalAuthGuardTemplate,
  createJwtAuthServiceSpecTemplate,
  createJwtAuthControllerSpecTemplate,
  createOAuthModuleTemplate,
  createOAuthServiceTemplate,
  createOAuthControllerTemplate,
  createGoogleStrategyTemplate,
  createOAuthServiceSpecTemplate,
  createRolesEnumTemplate,
  createRolesDecoratorTemplate,
  createRolesGuardTemplate,
  createRolesGuardSpecTemplate,
  createEmailModuleTemplate,
  createEmailServiceTemplate,
  createEmailControllerTemplate,
  createEmailServiceSpecTemplate,
} from '../templates/auth';

export interface GeneratedFile {
  filePath: string;
  content: string;
}

export class AuthGeneratorService {
  static generate(config: AuthGenerateConfig): GeneratedFile[] {
    const allFiles: GeneratedFile[] = [];

    for (const feature of config.features) {
      const files = this.getFilesForFeature(feature, config);
      allFiles.push(...files);
    }

    if (config.options.dryRun) {
      return allFiles;
    }

    for (const file of allFiles) {
      fs.ensureDirSync(path.dirname(file.filePath));
      fs.writeFileSync(file.filePath, file.content);
    }

    return allFiles;
  }

  static getFilesForFeature(
    feature: AuthFeature,
    config: AuthGenerateConfig,
  ): GeneratedFile[] {
    switch (feature) {
      case AuthFeature.JWT:
        return this.getJwtFiles(config);
      case AuthFeature.OAUTH:
        return this.getOAuthFiles(config);
      case AuthFeature.RBAC:
        return this.getRbacFiles(config);
      case AuthFeature.EMAIL_VERIFICATION:
        return this.getEmailFiles(config);
      default:
        return [];
    }
  }

  static resolveAuthDirectory(): string {
    const cwd = process.cwd();
    const srcPath = path.join(cwd, 'src');
    const baseDir = fs.existsSync(srcPath) ? srcPath : cwd;
    return path.join(baseDir, 'auth');
  }

  static getJwtFiles(config: AuthGenerateConfig): GeneratedFile[] {
    const authDir = this.resolveAuthDirectory();
    const files: GeneratedFile[] = [
      {
        filePath: path.join(authDir, 'auth.module.ts'),
        content: createJwtAuthModuleTemplate(),
      },
      {
        filePath: path.join(authDir, 'auth.service.ts'),
        content: createJwtAuthServiceTemplate(),
      },
      {
        filePath: path.join(authDir, 'auth.controller.ts'),
        content: createJwtAuthControllerTemplate(),
      },
      {
        filePath: path.join(authDir, 'strategies', 'jwt.strategy.ts'),
        content: createJwtStrategyTemplate(),
      },
      {
        filePath: path.join(authDir, 'strategies', 'local.strategy.ts'),
        content: createLocalStrategyTemplate(),
      },
      {
        filePath: path.join(authDir, 'guards', 'jwt-auth.guard.ts'),
        content: createJwtAuthGuardTemplate(),
      },
      {
        filePath: path.join(authDir, 'guards', 'local-auth.guard.ts'),
        content: createLocalAuthGuardTemplate(),
      },
    ];

    if (!config.options.skipSpec) {
      files.push(
        {
          filePath: path.join(authDir, 'auth.service.spec.ts'),
          content: createJwtAuthServiceSpecTemplate(),
        },
        {
          filePath: path.join(authDir, 'auth.controller.spec.ts'),
          content: createJwtAuthControllerSpecTemplate(),
        },
      );
    }

    return files;
  }

  static getOAuthFiles(config: AuthGenerateConfig): GeneratedFile[] {
    const authDir = this.resolveAuthDirectory();
    const oauthDir = path.join(authDir, 'oauth');
    const files: GeneratedFile[] = [
      {
        filePath: path.join(oauthDir, 'oauth.module.ts'),
        content: createOAuthModuleTemplate(),
      },
      {
        filePath: path.join(oauthDir, 'oauth.service.ts'),
        content: createOAuthServiceTemplate(),
      },
      {
        filePath: path.join(oauthDir, 'oauth.controller.ts'),
        content: createOAuthControllerTemplate(),
      },
      {
        filePath: path.join(oauthDir, 'strategies', 'google.strategy.ts'),
        content: createGoogleStrategyTemplate(),
      },
    ];

    if (!config.options.skipSpec) {
      files.push({
        filePath: path.join(oauthDir, 'oauth.service.spec.ts'),
        content: createOAuthServiceSpecTemplate(),
      });
    }

    return files;
  }

  static getRbacFiles(config: AuthGenerateConfig): GeneratedFile[] {
    const authDir = this.resolveAuthDirectory();
    const files: GeneratedFile[] = [
      {
        filePath: path.join(authDir, 'enums', 'role.enum.ts'),
        content: createRolesEnumTemplate(),
      },
      {
        filePath: path.join(authDir, 'decorators', 'roles.decorator.ts'),
        content: createRolesDecoratorTemplate(),
      },
      {
        filePath: path.join(authDir, 'guards', 'roles.guard.ts'),
        content: createRolesGuardTemplate(),
      },
    ];

    if (!config.options.skipSpec) {
      files.push({
        filePath: path.join(authDir, 'guards', 'roles.guard.spec.ts'),
        content: createRolesGuardSpecTemplate(),
      });
    }

    return files;
  }

  static getEmailFiles(config: AuthGenerateConfig): GeneratedFile[] {
    const authDir = this.resolveAuthDirectory();
    const emailDir = path.join(authDir, 'email');
    const files: GeneratedFile[] = [
      {
        filePath: path.join(emailDir, 'email.module.ts'),
        content: createEmailModuleTemplate(),
      },
      {
        filePath: path.join(emailDir, 'email.service.ts'),
        content: createEmailServiceTemplate(),
      },
      {
        filePath: path.join(emailDir, 'email.controller.ts'),
        content: createEmailControllerTemplate(),
      },
    ];

    if (!config.options.skipSpec) {
      files.push({
        filePath: path.join(emailDir, 'email.service.spec.ts'),
        content: createEmailServiceSpecTemplate(),
      });
    }

    return files;
  }
}
