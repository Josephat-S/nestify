export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
}

export enum Database {
  MYSQL = 'mysql',
  POSTGRES = 'postgres',
  MONGODB = 'mongodb',
}

export enum ORM {
  TYPEORM = 'TypeORM',
  PRISMA = 'Prisma',
}

export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRODUCTION = 'production',
}

export enum Schematic {
  MODULE = 'module',
  CONTROLLER = 'controller',
  SERVICE = 'service',
  GUARD = 'guard',
  INTERCEPTOR = 'interceptor',
  PIPE = 'pipe',
  AUTH = 'auth',
}

export const SCHEMATIC_ALIASES: Record<string, Schematic> = {
  module: Schematic.MODULE,
  mo: Schematic.MODULE,
  controller: Schematic.CONTROLLER,
  co: Schematic.CONTROLLER,
  service: Schematic.SERVICE,
  s: Schematic.SERVICE,
  guard: Schematic.GUARD,
  gu: Schematic.GUARD,
  interceptor: Schematic.INTERCEPTOR,
  i: Schematic.INTERCEPTOR,
  pipe: Schematic.PIPE,
  p: Schematic.PIPE,
  auth: Schematic.AUTH,
};

export enum AuthFeature {
  JWT = 'jwt',
  OAUTH = 'oauth',
  RBAC = 'rbac',
  EMAIL_VERIFICATION = 'email-verification',
}
