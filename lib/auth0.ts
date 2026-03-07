import { Auth0Client } from '@auth0/nextjs-auth0/server';

const requiredAuth0EnvVars = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_SECRET',
  'APP_BASE_URL',
] as const;

export const isAuth0Configured = requiredAuth0EnvVars.every((name) => {
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0;
});

export const auth0 = isAuth0Configured ? new Auth0Client() : null;
