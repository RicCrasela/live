import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import WalletClient from "@/components/WalletClient";
import { Logo } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { listTxns } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const txns = listTxns(user.id).map((txn) => ({
    id: txn.id,
    type: txn.type,
    label: txn.label,
    coins: txn.coins,
    createdAt: txn.createdAt,
  }));

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-[520px] px-4 pb-28 pt-6">
      <div className="flex items-center justify-between">
        <Logo size={24} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Dompet</span>
      </div>

      <h1 className="mt-5 text-xl font-extrabold">Koin VibeLive</h1>
      <p className="mb-4 mt-1 text-[11px] text-white/45">Top up koin lalu dukung host favoritmu saat live.</p>

      <WalletClient initialBalance={user.coins} initialTxns={txns} />

      <BottomNav />
    </main>
  );
}
