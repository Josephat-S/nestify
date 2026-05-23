import chalk from 'chalk';
import inquirer from 'inquirer';
import { Schematic, SCHEMATIC_ALIASES, AuthFeature } from '../constants/enums';
import {
  GenerateCommandOptions,
  GenerateConfig,
  AuthGenerateConfig,
} from '../types/project.types';
import { GenerateService } from '../services/generate.service';
import { AuthGeneratorService } from '../services/auth-generator.service';

export async function generateCommand(
  schematic: string,
  name: string,
  options: GenerateCommandOptions,
) {
  const resolvedSchematic = SCHEMATIC_ALIASES[schematic.toLowerCase()];

  if (!resolvedSchematic) {
    console.log(chalk.red(`\n❌ Unknown schematic: "${schematic}"`));
    printAvailableSchematics();
    process.exit(1);
  }

  // Handle auth schematic separately
  if (resolvedSchematic === Schematic.AUTH) {
    await handleAuthGeneration(options);
    return;
  }

  const config: GenerateConfig = {
    schematic: resolvedSchematic,
    name: name.toLowerCase(),
    options: {
      skipSpec: options.skipSpec || false,
      flat: options.flat || false,
      dryRun: options.dryRun || false,
    },
  };

  try {
    const files = GenerateService.generate(config);
    printResult(resolvedSchematic, name, files, options.dryRun);
  } catch (error) {
    console.error(chalk.red(`\n❌ Failed to generate ${resolvedSchematic}`));
    console.error(chalk.red(`Error: ${(error as Error).message}`));
    process.exit(1);
  }
}

async function handleAuthGeneration(
  options: GenerateCommandOptions,
): Promise<void> {
  const { authFeatures } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'authFeatures',
      message: 'Which authentication features would you like to include?',
      choices: [
        { name: 'JWT Authentication', value: AuthFeature.JWT },
        { name: 'OAuth (Google)', value: AuthFeature.OAUTH },
        { name: 'Role-Based Access Control (RBAC)', value: AuthFeature.RBAC },
        {
          name: 'Email Verification & Password Reset',
          value: AuthFeature.EMAIL_VERIFICATION,
        },
      ],
      validate: (input: AuthFeature[]) =>
        input.length > 0 || 'Please select at least one feature',
    },
  ]);

  const config: AuthGenerateConfig = {
    features: authFeatures,
    options: {
      skipSpec: options.skipSpec || false,
      flat: options.flat || false,
      dryRun: options.dryRun || false,
    },
  };

  try {
    const files = AuthGeneratorService.generate(config);

    if (options.dryRun) {
      console.log(chalk.yellow('\n🏃 Dry run - no files written\n'));
      console.log(chalk.cyan('Files that would be created:'));
    } else {
      console.log(chalk.green('\n✅ Authentication scaffolded successfully!\n'));
      console.log(chalk.cyan('Created files:'));
    }

    for (const file of files) {
      console.log(chalk.white(`  CREATE ${file.filePath}`));
    }

    if (!options.dryRun) {
      printAuthNextSteps(authFeatures);
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Failed to generate authentication'));
    console.error(chalk.red(`Error: ${(error as Error).message}`));
    process.exit(1);
  }
}

function printResult(
  schematic: string,
  name: string,
  files: { filePath: string }[],
  dryRun: boolean,
): void {
  if (dryRun) {
    console.log(chalk.yellow('\n🏃 Dry run - no files written\n'));
    console.log(chalk.cyan('Files that would be created:'));
  } else {
    console.log(chalk.green(`\n✅ Generated ${schematic}: ${name}\n`));
  }

  for (const file of files) {
    console.log(chalk.white(`  CREATE ${file.filePath}`));
  }
}

function printAvailableSchematics(): void {
  console.log(chalk.cyan('\nAvailable schematics:'));
  console.log(chalk.white('  module (mo)       - Generate a module'));
  console.log(chalk.white('  controller (co)   - Generate a controller'));
  console.log(chalk.white('  service (s)       - Generate a service'));
  console.log(chalk.white('  guard (gu)        - Generate a guard'));
  console.log(chalk.white('  interceptor (i)   - Generate an interceptor'));
  console.log(chalk.white('  pipe (p)          - Generate a pipe'));
  console.log(chalk.white('  auth              - Generate authentication'));
}

function printAuthNextSteps(features: AuthFeature[]): void {
  console.log(chalk.cyan('\n📋 Next steps:'));
  console.log(chalk.white('  1. Install required dependencies:'));

  const deps: string[] = ['@nestjs/passport', '@nestjs/jwt', 'passport'];

  if (features.includes(AuthFeature.JWT)) {
    deps.push('passport-jwt', 'passport-local');
    deps.push('@types/passport-jwt', '@types/passport-local');
  }
  if (features.includes(AuthFeature.OAUTH)) {
    deps.push('passport-google-oauth20', '@types/passport-google-oauth20');
  }

  console.log(chalk.gray(`     npm install ${deps.join(' ')}`));
  console.log(chalk.white('  2. Import AuthModule in your AppModule'));
  console.log(chalk.white('  3. Configure JWT_SECRET in your .env file'));

  if (features.includes(AuthFeature.OAUTH)) {
    console.log(
      chalk.white('  4. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,'),
    );
    console.log(chalk.white('     and GOOGLE_CALLBACK_URL in your .env'));
  }
}
