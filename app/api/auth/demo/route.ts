import { NextResponse, type NextRequest } from "next/server";
import { isProviderId } from "@/lib/oauth";
import { createSessionToken, sessionCookie } from "@/lib/session";
import { createDemoUser, publicUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const payload = (body ?? {}) as { name?: unknown; provider?: unknown };
  const rawName = typeof payload.name === "string" ? payload.name.trim() : "";
  const name = rawName.slice(0, 40) || "Penonton Baru";
  const provider =
    typeof payload.provider === "string" && isProviderId(payload.provider) ? payload.provider : "demo";

  const user = createDemoUser(name, provider);
  const res = NextResponse.json({ ok: true, user: publicUser(user) });
  res.cookies.set(sessionCookie.name, createSessionToken(user.id), sessionCookie.options);
  return res;
}
