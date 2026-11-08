"use client";

import { useState } from "react";
import Link from "next/link";
import { COIN_PACKAGES } from "@/lib/catalog";
import { rupiah, timeAgo } from "@/lib/format";

type Txn = { id: string; type: "topup" | "gift"; label: string; coins: number; createdAt: number };

export default function WalletClient({
  initialBalance,
  initialTxns,
}: {
  initialBalance: number;
  initialTxns: Txn[];
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [txns, setTxns] = useState<Txn[]>(initialTxns);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topUp = async (packageId: string) => {
    if (pending) return;
    setPending(packageId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = (await res.json()) as { ok?: boolean; balance?: number; txns?: Txn[]; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Top up gagal");
        return;
      }
      if (typeof data.balance === "number") setBalance(data.balance);
      if (data.txns) setTxns(data.txns);
      setMessage("Koin berhasil ditambahkan (pembayaran demo)");
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#2a1030] via-[#171425] to-[#0f1b24] p-5">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-vibe-red/25 blur-2xl" />
        <p className="text-[11px] uppercase tracking-widest text-white/45">Saldo koin</p>
        <p className="mt-1 flex items-center gap-2 text-4xl font-extrabold">
          <span aria-hidden>🪙</span>
          {balance.toLocaleString("id-ID")}
        </p>
        <p className="mt-1 text-[11px] text-white/45">Gunakan koin untuk mengirim gift ke host live.</p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold">Top up koin</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {COIN_PACKAGES.map((pack) => (
            <button
              key={pack.id}
              onClick={() => void topUp(pack.id)}
              disabled={pending === pack.id}
              className="relative flex flex-col items-start gap-1 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 text-left transition hover:border-vibe-red/50 hover:bg-white/[0.08] disabled:opacity-60"
            >
              {pack.bonus > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-vibe-cyan/20 px-2 py-[2px] text-[9px] font-bold text-vibe-cyan">
                  +{pack.bonus} bonus
                </span>
              )}
              <span className="text-lg font-extrabold">🪙 {pack.coins.toLocaleString("id-ID")}</span>
              <span className="text-[10px] text-white/45">{pack.label}</span>
              <span className="mt-1 text-xs font-semibold text-amber-300">{rupiah(pack.price)}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-white/35">
          Mode demo: tidak ada transaksi uang sungguhan. Koin ditambahkan langsung ke akunmu.
        </p>
        {message && <p className="mt-2 rounded-xl bg-emerald-400/15 px-3 py-2 text-[11px] text-emerald-300">{message}</p>}
        {error && <p className="mt-2 rounded-xl bg-vibe-red/15 px-3 py-2 text-[11px] text-vibe-red">{error}</p>}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold">Riwayat transaksi</h2>
        {txns.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-[11px] text-white/40">
            Belum ada transaksi. Top up atau kirim gift untuk melihat riwayat.
          </p>
        ) : (
          <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {txns.map((txn) => (
              <li key={txn.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[12px] font-medium text-white/90">{txn.label}</p>
                  <p className="text-[10px] text-white/40">
                    {txn.type === "topup" ? "Top up" : "Gift"} · {timeAgo(txn.createdAt)}
                  </p>
                </div>
                <span className={`text-xs font-bold ${txn.coins > 0 ? "text-emerald-300" : "text-vibe-red"}`}>
                  {txn.coins > 0 ? "+" : ""}
                  {txn.coins.toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/" className="block rounded-xl bg-white/10 py-3 text-center text-xs font-semibold text-white/80">
        Kembali ke feed live
      </Link>
    </div>
  );
}
