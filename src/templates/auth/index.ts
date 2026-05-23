export {
  createJwtAuthModuleTemplate,
  createJwtAuthServiceTemplate,
  createJwtAuthControllerTemplate,
  createJwtStrategyTemplate,
  createLocalStrategyTemplate,
  createJwtAuthGuardTemplate,
  createLocalAuthGuardTemplate,
  createJwtAuthServiceSpecTemplate,
  createJwtAuthControllerSpecTemplate,
} from './jwt.template';

export {
  createOAuthModuleTemplate,
  createOAuthServiceTemplate,
  createOAuthControllerTemplate,
  createGoogleStrategyTemplate,
  createOAuthServiceSpecTemplate,
} from './oauth.template';

export {
  createRolesEnumTemplate,
  createRolesDecoratorTemplate,
  createRolesGuardTemplate,
  createRolesGuardSpecTemplate,
} from './rbac.template';

export {
  createEmailModuleTemplate,
  createEmailServiceTemplate,
} from './email.template';

export { createEmailControllerTemplate } from './email-controller.template';

export { createEmailServiceSpecTemplate } from './email-spec.template';
