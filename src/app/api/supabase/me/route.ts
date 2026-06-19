import { withSupabaseRoute } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = withSupabaseRoute({ auth: 'user' }, async (_request, ctx) => {
  return Response.json({
    ok: true,
    authMode: ctx.authMode,
    user: ctx.userClaims,
    jwt: {
      subject: ctx.jwtClaims?.sub ?? null,
      role: ctx.jwtClaims?.role ?? null,
      email: ctx.jwtClaims?.email ?? null,
      expiresAt: ctx.jwtClaims?.exp ?? null,
    },
  });
});

export async function GET(request: Request) {
  return handler(request);
}
