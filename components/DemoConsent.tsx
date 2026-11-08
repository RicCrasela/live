"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { socialLabel, SocialGlyph } from "./ui";

export default function DemoConsent({ provider }: { provider: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = socialLabel(provider);

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), provider }),
      });
      if (!res.ok) throw new Error("failed");
      router.push("/");
      router.refresh();
    } catch {
      setError("Gagal masuk. Coba lagi ya.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col justify-center px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-[#12121a]/90 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <SocialGlyph id={provider} size={36} />
          <div>
            <p className="text-sm font-bold">Lanjutkan dengan {label}</p>
            <p className="text-[11px] text-white/50">VibeLive ingin mengakses profil publikmu</p>
          </div>
        </div>

        <div className="mt-5 space-y-2 rounded-2xl bg-white/[0.04] p-3 text-[11px] text-white/60">
          <p>• Nama tampilan dan foto profil</p>
          <p>• Alamat email (jika tersedia)</p>
          <p className="text-white/35">
            Mode demo: kredensial OAuth {label} belum diatur di server, jadi data profil disimulasikan.
          </p>
        </div>

        <label className="mt-5 block text-[11px] font-medium text-white/60" htmlFor="display-name">
          Nama tampilan
        </label>
        <input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          maxLength={40}
          placeholder="Contoh: Nadia Ayu"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3 text-sm outline-none placeholder:text-white/30 focus:border-vibe-red/60"
        />

        {error && <p className="mt-3 rounded-xl bg-vibe-red/15 px-3 py-2 text-xs text-vibe-red">{error}</p>}

        <button
          onClick={() => void submit()}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-vibe-red to-[#ff5f8f] py-3 text-sm font-bold shadow-lg disabled:opacity-60"
        >
          {loading ? "Menghubungkan..." : `Lanjutkan sebagai ${name.trim() || "Penonton Baru"}`}
        </button>
        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/30">
          Dengan melanjutkan kamu menyetujui Ketentuan Layanan dan Kebijakan Privasi VibeLive.
        </p>
      </div>
    </div>
  );
}
