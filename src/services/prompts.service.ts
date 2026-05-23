import inquirer from 'inquirer';
import { ProjectAnswers } from '../types/project.types';
import { PackageManager, Database, ORM, AuthFeature } from '../constants/enums';

export class PromptsService {
  static async getProjectDetails(
    defaultPackageManager?: string,
  ): Promise<ProjectAnswers> {
    const answers: Partial<ProjectAnswers> = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Which package manager would you like to use?',
        choices: Object.values(PackageManager),
        default: defaultPackageManager || PackageManager.NPM,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: 'A NestJS application',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author:',
        default: '',
      },
      {
        type: 'list',
        name: 'database',
        message: 'Which database would you like to use?',
        choices: Object.values(Database),
        default: Database.MYSQL,
      },
      {
        type: 'confirm',
        name: 'useDocker',
        message: 'Add Docker support?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'useAuth',
        message: 'Add authentication setup?',
        default: false,
      },
    ]);

    // Ask for ORM choice only if MySQL or PostgreSQL is selected
    if (
      answers.database === Database.MYSQL ||
      answers.database === Database.POSTGRES
    ) {
      const ormAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'orm',
          message: 'Which ORM would you like to use?',
          choices: Object.values(ORM),
          default: ORM.TYPEORM,
        },
      ]);
      answers.orm = ormAnswer.orm;
    }

    // Ask for auth features if authentication is enabled
    if (answers.useAuth) {
      const authAnswer = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'authFeatures',
          message: 'Which authentication features would you like?',
          choices: [
            { name: 'JWT Authentication', value: AuthFeature.JWT },
            { name: 'OAuth (Google)', value: AuthFeature.OAUTH },
            {
              name: 'Role-Based Access Control (RBAC)',
              value: AuthFeature.RBAC,
            },
            {
              name: 'Email Verification & Password Reset',
              value: AuthFeature.EMAIL_VERIFICATION,
            },
          ],
          validate: (input: AuthFeature[]) =>
            input.length > 0 || 'Please select at least one feature',
        },
      ]);
      answers.authFeatures = authAnswer.authFeatures;
    }

    return answers as ProjectAnswers;
  }
}
