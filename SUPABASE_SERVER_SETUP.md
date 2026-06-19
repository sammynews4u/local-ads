# @supabase/server setup

This project now includes `@supabase/server` and `@supabase/supabase-js`.

## Environment variables

Set these in local `.env` and in Vercel. Do not commit real secrets.

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key-from-supabase-dashboard>
SUPABASE_SECRET_KEY=<secret-key-from-supabase-dashboard>
SUPABASE_JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
```

`SUPABASE_SECRET_KEY` must never be exposed through a `NEXT_PUBLIC_` variable.

## Route helper

The reusable Next.js route adapter lives here:

```text
src/lib/supabase/server.ts
```

Use it like this:

```ts
import { withSupabaseRoute } from '@/lib/supabase/server'

const handler = withSupabaseRoute({ auth: 'user' }, async (_request, ctx) => {
  const { data, error } = await ctx.supabase.from('todos').select()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
})

export async function GET(request: Request) {
  return handler(request)
}
```

## Verification endpoints

These endpoints were added to verify the SDK setup:

```text
GET /api/supabase/health
GET /api/supabase/me
GET /api/supabase/admin-check
```

### `/api/supabase/health`

Public health check using `auth: "none"`. It confirms whether the Supabase server env variables are present without exposing their values.

### `/api/supabase/me`

Requires a Supabase Auth user JWT:

```bash
curl https://your-domain.com/api/supabase/me \
  -H "Authorization: Bearer <SUPABASE_USER_ACCESS_TOKEN>"
```

### `/api/supabase/admin-check`

Requires the secret key through the `apikey` header:

```bash
curl https://your-domain.com/api/supabase/admin-check \
  -H "apikey: <SUPABASE_SECRET_KEY>"
```

## Important architecture note

The existing application login still uses the app's own `users` table and custom JWT cookie. `@supabase/server` verifies Supabase Auth JWTs. Do not replace existing protected routes with `auth: "user"` until you migrate login/registration to Supabase Auth, otherwise your current users will be locked out.
