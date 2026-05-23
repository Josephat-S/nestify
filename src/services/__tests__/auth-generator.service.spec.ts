import fs from 'fs-extra';
import path from 'path';
import { AuthGeneratorService } from '../auth-generator.service';
import { AuthFeature } from '../../constants/enums';
import { AuthGenerateConfig } from '../../types/project.types';

jest.mock('fs-extra');

describe('AuthGeneratorService', () => {
  const mockCwd = '/project';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
    (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
      if (p === path.join(mockCwd, 'src')) return true;
      return false;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('resolveAuthDirectory', () => {
    it('should resolve to src/auth when src exists', () => {
      const result = AuthGeneratorService.resolveAuthDirectory();
      expect(result).toBe(path.join(mockCwd, 'src', 'auth'));
    });

    it('should resolve to cwd/auth when src does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = AuthGeneratorService.resolveAuthDirectory();
      expect(result).toBe(path.join(mockCwd, 'auth'));
    });
  });

  describe('getJwtFiles', () => {
    it('should return JWT auth files with specs', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.JWT],
        options: { skipSpec: false, flat: false, dryRun: false },
      };

      const files = AuthGeneratorService.getJwtFiles(config);

      const filePaths = files.map((f) => f.filePath);
      expect(filePaths).toContainEqual(
        expect.stringContaining('auth.module.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('auth.service.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('auth.controller.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('jwt.strategy.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('local.strategy.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('jwt-auth.guard.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('local-auth.guard.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('auth.service.spec.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('auth.controller.spec.ts'),
      );
    });

    it('should skip spec files when skipSpec is true', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.JWT],
        options: { skipSpec: true, flat: false, dryRun: false },
      };

      const files = AuthGeneratorService.getJwtFiles(config);
      const specFiles = files.filter((f) => f.filePath.includes('.spec.'));

      expect(specFiles).toHaveLength(0);
    });
  });

  describe('getOAuthFiles', () => {
    it('should return OAuth files', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.OAUTH],
        options: { skipSpec: false, flat: false, dryRun: false },
      };

      const files = AuthGeneratorService.getOAuthFiles(config);
      const filePaths = files.map((f) => f.filePath);

      expect(filePaths).toContainEqual(
        expect.stringContaining('oauth.module.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('oauth.service.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('oauth.controller.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('google.strategy.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('oauth.service.spec.ts'),
      );
    });
  });

  describe('getRbacFiles', () => {
    it('should return RBAC files', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.RBAC],
        options: { skipSpec: false, flat: false, dryRun: false },
      };

      const files = AuthGeneratorService.getRbacFiles(config);
      const filePaths = files.map((f) => f.filePath);

      expect(filePaths).toContainEqual(
        expect.stringContaining('role.enum.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('roles.decorator.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('roles.guard.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('roles.guard.spec.ts'),
      );
    });

    it('should skip spec files when skipSpec is true', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.RBAC],
        options: { skipSpec: true, flat: false, dryRun: false },
      };

      const files = AuthGeneratorService.getRbacFiles(config);
      const specFiles = files.filter((f) => f.filePath.includes('.spec.'));

      expect(specFiles).toHaveLength(0);
    });
  });

  describe('getEmailFiles', () => {
    it('should return email verification files', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.EMAIL_VERIFICATION],
        options: { skipSpec: false, flat: false, dryRun: false },
      };

      const files = AuthGeneratorService.getEmailFiles(config);
      const filePaths = files.map((f) => f.filePath);

      expect(filePaths).toContainEqual(
        expect.stringContaining('email.module.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('email.service.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('email.controller.ts'),
      );
      expect(filePaths).toContainEqual(
        expect.stringContaining('email.service.spec.ts'),
      );
    });
  });

  describe('generate', () => {
    it('should not write files in dry-run mode', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.JWT],
        options: { skipSpec: false, flat: false, dryRun: true },
      };

      const files = AuthGeneratorService.generate(config);

      expect(files.length).toBeGreaterThan(0);
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should write files when not in dry-run mode', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.JWT],
        options: { skipSpec: false, flat: false, dryRun: false },
      };

      AuthGeneratorService.generate(config);

      expect(fs.ensureDirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should generate files for multiple features', () => {
      const config: AuthGenerateConfig = {
        features: [AuthFeature.JWT, AuthFeature.RBAC, AuthFeature.OAUTH],
        options: { skipSpec: false, flat: false, dryRun: true },
      };

      const files = AuthGeneratorService.generate(config);

      const filePaths = files.map((f) => f.filePath);
      // JWT files
      expect(filePaths).toContainEqual(
        expect.stringContaining('auth.module.ts'),
      );
      // RBAC files
      expect(filePaths).toContainEqual(
        expect.stringContaining('roles.guard.ts'),
      );
      // OAuth files
      expect(filePaths).toContainEqual(
        expect.stringContaining('oauth.module.ts'),
      );
    });
  });
});
