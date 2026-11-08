import { NextResponse, type NextRequest } from "next/server";
import { PROVIDERS, isProviderId } from "@/lib/oauth";
import { createSessionToken, sessionCookie } from "@/lib/session";
import { upsertOAuthUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("host") ?? req.nextUrl.host;
  const origin = `${proto}://${host}`;

  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, origin));

  if (!isProviderId(provider)) return fail("provider");
  const cfg = PROVIDERS[provider];
  if (!cfg.configured()) return fail("not_configured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("vibe_oauth_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) return fail("state");

  try {
    const redirectUri = `${origin}/api/auth/${provider}/callback`;
    const accessToken = await cfg.exchange({
      code,
      redirectUri,
      codeVerifier: req.cookies.get("vibe_oauth_verifier")?.value,
    });
    const profile = await cfg.profile(accessToken);
    const user = upsertOAuthUser({
      provider,
      providerId: profile.id,
      name: profile.name,
      email: profile.email,
      handle: profile.handle,
    });

    const res = NextResponse.redirect(new URL("/", origin));
    res.cookies.set(sessionCookie.name, createSessionToken(user.id), sessionCookie.options);
    res.cookies.delete("vibe_oauth_state");
    res.cookies.delete("vibe_oauth_verifier");
    res.cookies.delete("vibe_oauth_provider");
    return res;
  } catch {
    return fail("oauth");
  }
}
