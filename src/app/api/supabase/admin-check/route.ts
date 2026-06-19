import { withSupabaseRoute } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = withSupabaseRoute({ auth: 'secret' }, async (_request, ctx) => {
  return Response.json({
    ok: true,
    authMode: ctx.authMode,
    adminClientAvailable: Boolean(ctx.supabaseAdmin),
  });
});

export async function GET(request: Request) {
  return handler(request);
}
