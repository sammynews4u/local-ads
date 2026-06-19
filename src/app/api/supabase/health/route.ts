import { withSupabaseRoute, getSupabaseServerEnvStatus } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = withSupabaseRoute({ auth: 'none' }, async () => {
  const env = getSupabaseServerEnvStatus();

  return Response.json({
    ok: true,
    sdk: '@supabase/server',
    authMode: 'none',
    env,
    timestamp: new Date().toISOString(),
  });
});

export async function GET(request: Request) {
  return handler(request);
}
