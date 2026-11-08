import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getUserById, type User } from "./store";

const COOKIE_NAME = "vibe_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  const env = process.env.SESSION_SECRET;
  if (env && env.length >= 16) return env;
  const g = globalThis as unknown as { __vibeliveSecret?: string };
  if (!g.__vibeliveSecret) g.__vibeliveSecret = randomBytes(32).toString("hex");
  return g.__vibeliveSecret;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export function createSessionToken(userId: string): string {
  const payload = JSON.stringify({ uid: userId, iat: Date.now() });
  const encoded = b64url(payload);
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(fromB64url(encoded).toString("utf8")) as { uid?: string; iat?: number };
    if (!parsed.uid) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const uid = verifySessionToken(store.get(COOKIE_NAME)?.value);
  return getUserById(uid);
}

export async function getSessionId(): Promise<string> {
  const store = await cookies();
  const raw = store.get("vibe_visitor")?.value;
  return raw || "anon";
}
