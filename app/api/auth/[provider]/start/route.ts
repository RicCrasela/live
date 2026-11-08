import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { PROVIDERS, isProviderId } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function appOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (!isProviderId(provider)) {
    return NextResponse.redirect(new URL("/login?error=provider", appOrigin(req)));
  }
  const cfg = PROVIDERS[provider];
  if (!cfg.configured()) {
    return NextResponse.redirect(new URL(`/auth/demo?provider=${provider}`, appOrigin(req)));
  }

  const origin = appOrigin(req);
  const redirectUri = `${origin}/api/auth/${provider}/callback`;
  const state = randomBytes(16).toString("hex");
  const verifier = base64url(randomBytes(32));
  const authUrl = cfg.buildAuthUrl({ state, redirectUri, codeVerifier: verifier });

  const res = NextResponse.redirect(authUrl);
  const cookieBase = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  };
  res.cookies.set("vibe_oauth_state", state, cookieBase);
  res.cookies.set("vibe_oauth_verifier", verifier, cookieBase);
  res.cookies.set("vibe_oauth_provider", provider, cookieBase);
  return res;
}
