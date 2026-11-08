"use client";

import Link from "next/link";
import { useState } from "react";
import { GIFTS } from "@/lib/catalog";
import type { ChatMessage } from "@/lib/catalog";

export default function GiftSheet({
  streamId,
  balance,
  onClose,
  onBalance,
  onGift,
}: {
  streamId: string;
  balance: number;
  onClose: () => void;
  onBalance: (coins: number) => void;
  onGift: (message: ChatMessage, giftName: string, emoji: string) => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async (giftId: string) => {
    if (pending) return;
    setPending(giftId);
    setError(null);
    try {
      const res = await fetch(`/api/streams/${streamId}/gifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        balance?: number;
        gift?: { name: string; emoji: string };
        message?: ChatMessage;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Gift gagal dikirim");
        return;
      }
      if (typeof data.balance === "number") onBalance(data.balance);
      if (data.message && data.gift) onGift(data.message, data.gift.name, data.gift.emoji);
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Tutup gift" />
      <div className="relative z-10 w-full max-w-[480px] rounded-t-3xl border-t border-white/10 bg-[#14141b] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Kirim Gift</p>
            <p className="text-[11px] text-white/45">Dukung host favoritmu saat live</p>
          </div>
          <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
            🪙 {balance.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {GIFTS.map((gift) => {
            const affordable = balance >= gift.coins;
            return (
              <button
                key={gift.id}
                onClick={() => void send(gift.id)}
                disabled={!affordable || pending === gift.id}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition ${
                  affordable
                    ? "border-white/10 bg-white/[0.06] hover:border-white/25 hover:bg-white/10"
                    : "border-white/5 bg-white/[0.02] opacity-45"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {gift.emoji}
                </span>
                <span className="text-[11px] font-medium text-white/85">{gift.name}</span>
                <span className="text-[11px] font-semibold text-amber-300">🪙 {gift.coins.toLocaleString("id-ID")}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="mt-3 rounded-xl bg-vibe-red/15 px-3 py-2 text-xs text-vibe-red">{error}</p>}

        <div className="mt-3 flex items-center justify-between">
          <Link href="/wallet" className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/85">
            + Top up koin
          </Link>
          <button onClick={onClose} className="rounded-full bg-white/5 px-3 py-2 text-xs text-white/60">
            Nanti saja
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/30">Pembayaran koin masih dalam mode demo</p>
      </div>
    </div>
  );
}
