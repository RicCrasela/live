import type { Avatar as AvatarType } from "@/lib/store";

export function Logo({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="grid place-items-center rounded-[10px] bg-gradient-to-br from-vibe-red to-[#7a5cff] shadow-[0_8px_24px_-8px_rgba(254,44,85,0.9)]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.62, height: size * 0.62 }}>
          <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="white" />
        </svg>
      </span>
      <span className="text-[19px] font-extrabold tracking-tight">
        Vibe<span className="brand-gradient">Live</span>
      </span>
    </span>
  );
}

export function Avatar({
  avatar,
  name,
  size = 46,
  ring = false,
  live = false,
}: {
  avatar: AvatarType;
  name: string;
  size?: number;
  ring?: boolean;
  live?: boolean;
}) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {live && (
        <span className="absolute inset-0 animate-pulseRing rounded-full border-2 border-vibe-red" />
      )}
      <span
        className={`grid h-full w-full place-items-center rounded-full ${
          ring ? "ring-2 ring-white/80" : "ring-1 ring-white/15"
        }`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
          fontSize: size * 0.46,
        }}
        aria-label={name}
      >
        <span aria-hidden>{avatar.emoji}</span>
      </span>
    </span>
  );
}

const SOCIAL_META: Record<string, { label: string; bg: string; glyph: string }> = {
  google: { label: "Google", bg: "linear-gradient(135deg,#4285f4,#ea4335)", glyph: "G" },
  facebook: { label: "Facebook", bg: "linear-gradient(135deg,#1877f2,#0a4fa8)", glyph: "f" },
  twitter: { label: "X", bg: "linear-gradient(135deg,#1a1a1a,#3a3a3a)", glyph: "X" },
  tiktok: { label: "TikTok", bg: "linear-gradient(135deg,#25f4ee,#fe2c55)", glyph: "♪" },
};

export function SocialGlyph({ id, size = 20 }: { id: string; size?: number }) {
  const meta = SOCIAL_META[id] ?? SOCIAL_META.google;
  return (
    <span
      className="grid place-items-center rounded-full font-black text-white"
      style={{ width: size, height: size, backgroundImage: meta.bg, fontSize: size * 0.58 }}
      aria-hidden
    >
      {meta.glyph}
    </span>
  );
}

export function socialLabel(id: string): string {
  return SOCIAL_META[id]?.label ?? id;
}

export function LivePill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[6px] bg-gradient-to-r from-vibe-red to-[#ff5f8f] px-1.5 py-[2px] text-[10px] font-bold uppercase tracking-wide text-white ${className}`}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      Live
    </span>
  );
}

export function CoinPill({ coins }: { coins: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
      <span aria-hidden>🪙</span>
      {coins.toLocaleString("id-ID")}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-2xl">📺</div>
      <p className="text-sm font-semibold text-white/90">{title}</p>
      {hint && <p className="text-xs leading-relaxed text-white/50">{hint}</p>}
    </div>
  );
}
