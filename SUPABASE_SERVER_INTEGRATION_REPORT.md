# Supabase Server SDK Integration Report

## Summary

Installed and configured `@supabase/server` in the v5 Local Ads Network project.

The project still keeps the existing custom login system intact. This was intentional: the current app authenticates against the local `users` table with password hashes and custom JWT cookies. `@supabase/server` validates Supabase Auth JWTs, so replacing every protected route immediately would lock out existing app users unless the whole login/register system is migrated to Supabase Auth.

## Installed packages

- `@supabase/server`
- `@supabase/supabase-js`

`@supabase/supabase-js` is included because it is the peer client used by `@supabase/server` for `ctx.supabase` and `ctx.supabaseAdmin`.

## New files

```text
src/lib/supabase/server.ts
src/app/api/supabase/health/route.ts
src/app/api/supabase/me/route.ts
src/app/api/supabase/admin-check/route.ts
SUPABASE_SERVER_SETUP.md
SUPABASE_SERVER_INTEGRATION_REPORT.md
```

## Modified files

```text
package.json
package-lock.json
.env.example
README.md
```

## Added route helper

`src/lib/supabase/server.ts` exports:

```text
withSupabaseRoute
createSupabaseRouteContext
getSupabaseServerEnvStatus
```

Use `withSupabaseRoute` in Next.js App Router API routes. It wraps `withSupabase` from `@supabase/server` and accepts standard Web `Request` objects.

## Added verification routes

```text
GET /api/supabase/health
```

Public SDK/env check using `auth: "none"`. It does not expose secret values.

```text
GET /api/supabase/me
```

Requires a Supabase Auth JWT:

```bash
curl https://your-domain.com/api/supabase/me \
  -H "Authorization: Bearer <SUPABASE_USER_ACCESS_TOKEN>"
```

```text
GET /api/supabase/admin-check
```

Requires the Supabase secret key in the `apikey` header:

```bash
curl https://your-domain.com/api/supabase/admin-check \
  -H "apikey: <SUPABASE_SECRET_KEY>"
```

## Environment variables added

```env
SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<YOUR_SUPABASE_PUBLISHABLE_KEY>
SUPABASE_SECRET_KEY=<YOUR_SUPABASE_SECRET_KEY_DO_NOT_EXPOSE>
SUPABASE_JWKS_URL=https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/.well-known/jwks.json
```

The secret key must only be configured in server environments such as Vercel Environment Variables. It must not be committed and must never be prefixed with `NEXT_PUBLIC_`.

## Verification performed

```text
npm run typecheck
```

Result: passed.

```text
npm run build
```

Result: Next.js compiled successfully, but the sandbox timed out while the build process was still in the TypeScript/build pipeline. `npm run typecheck` already passed independently.

## Production warning

Do not replace existing custom-auth routes with `auth: "user"` yet. `auth: "user"` expects a Supabase Auth JWT on the `Authorization` header. The app's current browser login creates a custom JWT cookie, not a Supabase Auth session.

Recommended next step: migrate login/register to Supabase Auth first, then move protected API routes from the custom `getCurrentUser()` helper to `withSupabaseRoute({ auth: "user" })`.
