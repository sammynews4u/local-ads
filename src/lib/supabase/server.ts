import { createSupabaseContext, withSupabase } from '@supabase/server';
import type {
  AuthModeWithKey,
  SupabaseContext,
  WithSupabaseConfig,
} from '@supabase/server';

export type SupabaseServerContext<Database = unknown> = SupabaseContext<Database>;
export type SupabaseServerAuthMode = AuthModeWithKey | AuthModeWithKey[];

export const SUPABASE_SERVER_REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_JWKS_URL',
] as const;

export function getSupabaseServerEnvStatus() {
  const missing = SUPABASE_SERVER_REQUIRED_ENV.filter((key) => !process.env[key]);

  return {
    configured: missing.length === 0,
    missing,
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasPublishableKey: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
    hasSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY),
    hasJwksUrl: Boolean(process.env.SUPABASE_JWKS_URL || process.env.SUPABASE_JWKS),
  };
}

/**
 * Next.js route-handler adapter for @supabase/server.
 *
 * The SDK's withSupabase wrapper works with the standard Web Request/Response
 * interface. Next.js route handlers also receive a Web-compatible Request, so
 * this adapter keeps every Supabase-backed route small and consistent.
 */
export function withSupabaseRoute<Database = unknown>(
  config: WithSupabaseConfig,
  handler: (request: Request, ctx: SupabaseServerContext<Database>) => Promise<Response>,
) {
  const wrapped = withSupabase<Database>(config, handler);

  return async function supabaseRouteHandler(request: Request): Promise<Response> {
    return wrapped(request);
  };
}

/**
 * Lower-level helper for route handlers that need custom 401/403 responses.
 */
export async function createSupabaseRouteContext<Database = unknown>(
  request: Request,
  config: WithSupabaseConfig = { auth: 'user' },
) {
  return createSupabaseContext<Database>(request, config);
}
