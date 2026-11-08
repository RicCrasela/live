export type ProviderId = "google" | "facebook" | "twitter" | "tiktok";

export interface SocialProfile {
  id: string;
  name: string;
  email?: string;
  handle?: string;
}

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  color: string;
  configured: () => boolean;
  buildAuthUrl: (args: { state: string; redirectUri: string; codeVerifier?: string }) => string;
  exchange: (args: { code: string; redirectUri: string; codeVerifier?: string }) => Promise<string>;
  profile: (accessToken: string) => Promise<SocialProfile>;
}

function env(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OAuth request gagal (${res.status}): ${body.slice(0, 180)}`);
  }
  return (await res.json()) as T;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  google: {
    id: "google",
    label: "Google",
    color: "#ea4335",
    configured: () => Boolean(env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")),
    buildAuthUrl: ({ state, redirectUri }) => {
      const params = new URLSearchParams({
        client_id: env("GOOGLE_CLIENT_ID") ?? "",
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
        access_type: "offline",
        prompt: "select_account",
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    },
    exchange: async ({ code, redirectUri }) => {
      const data = await jsonFetch<{ access_token: string }>("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env("GOOGLE_CLIENT_ID") ?? "",
          client_secret: env("GOOGLE_CLIENT_SECRET") ?? "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      return data.access_token;
    },
    profile: async (accessToken) => {
      const data = await jsonFetch<{ sub: string; name?: string; email?: string }>(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return { id: data.sub, name: data.name ?? "Pengguna Google", email: data.email };
    },
  },

  facebook: {
    id: "facebook",
    label: "Facebook",
    color: "#1877f2",
    configured: () => Boolean(env("FACEBOOK_APP_ID") && env("FACEBOOK_APP_SECRET")),
    buildAuthUrl: ({ state, redirectUri }) => {
      const params = new URLSearchParams({
        client_id: env("FACEBOOK_APP_ID") ?? "",
        redirect_uri: redirectUri,
        response_type: "code",
        state,
        scope: "email,public_profile",
      });
      return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
    },
    exchange: async ({ code, redirectUri }) => {
      const params = new URLSearchParams({
        client_id: env("FACEBOOK_APP_ID") ?? "",
        client_secret: env("FACEBOOK_APP_SECRET") ?? "",
        redirect_uri: redirectUri,
        code,
      });
      const data = await jsonFetch<{ access_token: string }>(
        `https://graph.facebook.com/v19.0/oauth/access_token?${params}`,
      );
      return data.access_token;
    },
    profile: async (accessToken) => {
      const data = await jsonFetch<{ id: string; name?: string; email?: string }>(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`,
      );
      return { id: data.id, name: data.name ?? "Pengguna Facebook", email: data.email };
    },
  },

  twitter: {
    id: "twitter",
    label: "X (Twitter)",
    color: "#0f1419",
    configured: () => Boolean(env("TWITTER_CLIENT_ID") && env("TWITTER_CLIENT_SECRET")),
    buildAuthUrl: ({ state, redirectUri, codeVerifier }) => {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: env("TWITTER_CLIENT_ID") ?? "",
        redirect_uri: redirectUri,
        scope: "users.read tweet.read offline.access",
        state,
        code_challenge: codeVerifier ?? "challenge",
        code_challenge_method: "S256",
      });
      return `https://twitter.com/i/oauth2/authorize?${params}`;
    },
    exchange: async ({ code, redirectUri, codeVerifier }) => {
      const basic = Buffer.from(
        `${env("TWITTER_CLIENT_ID") ?? ""}:${env("TWITTER_CLIENT_SECRET") ?? ""}`,
      ).toString("base64");
      const data = await jsonFetch<{ access_token: string }>("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basic}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: env("TWITTER_CLIENT_ID") ?? "",
          redirect_uri: redirectUri,
          code_verifier: codeVerifier ?? "",
        }),
      });
      return data.access_token;
    },
    profile: async (accessToken) => {
      const data = await jsonFetch<{ data: { id: string; name: string; username: string } }>(
        "https://api.twitter.com/2/users/me?user.fields=username",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return {
        id: data.data.id,
        name: data.data.name,
        handle: data.data.username,
      };
    },
  },

  tiktok: {
    id: "tiktok",
    label: "TikTok",
    color: "#25f4ee",
    configured: () => Boolean(env("TIKTOK_CLIENT_KEY") && env("TIKTOK_CLIENT_SECRET")),
    buildAuthUrl: ({ state, redirectUri }) => {
      const params = new URLSearchParams({
        client_key: env("TIKTOK_CLIENT_KEY") ?? "",
        response_type: "code",
        scope: "user.info.basic",
        redirect_uri: redirectUri,
        state,
      });
      return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
    },
    exchange: async ({ code, redirectUri }) => {
      const data = await jsonFetch<{ access_token: string }>("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: env("TIKTOK_CLIENT_KEY") ?? "",
          client_secret: env("TIKTOK_CLIENT_SECRET") ?? "",
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });
      return data.access_token;
    },
    profile: async (accessToken) => {
      const data = await jsonFetch<{
        data: { user: { open_id: string; display_name?: string; username?: string } };
      }>("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        id: data.data.user.open_id,
        name: data.data.user.display_name ?? "Pengguna TikTok",
        handle: data.data.user.username,
      };
    },
  },
};

export function isProviderId(value: string): value is ProviderId {
  return value === "google" || value === "facebook" || value === "twitter" || value === "tiktok";
}

export function providerStatus(): Array<{ id: ProviderId; label: string; color: string; configured: boolean }> {
  return Object.values(PROVIDERS).map((p) => ({
    id: p.id,
    label: p.label,
    color: p.color,
    configured: p.configured(),
  }));
}
