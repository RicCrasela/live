import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import { Avatar, EmptyState, Logo, socialLabel } from "@/components/ui";
import { compact } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { listStreams, listTxns, publicUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const me = publicUser(user);
  if (!me) redirect("/login");

  const followed = listStreams(user.id, "following");
  const txns = listTxns(user.id);
  const spent = txns.filter((t) => t.coins < 0).reduce((sum, t) => sum + Math.abs(t.coins), 0);
  const gained = txns.filter((t) => t.coins > 0).reduce((sum, t) => sum + t.coins, 0);

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-[520px] px-4 pb-28 pt-6">
      <div className="flex items-center justify-between">
        <Logo size={24} />
        <Link href="/wallet" className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
          🪙 {me.coins.toLocaleString("id-ID")}
        </Link>
      </div>

      <section className="mt-6 flex flex-col items-center text-center">
        <Avatar avatar={me.avatar} name={me.name} size={84} ring />
        <h1 className="mt-3 text-lg font-extrabold">{me.name}</h1>
        <p className="text-[12px] text-white/50">@{me.handle}</p>
        <span className="mt-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/60">
          Terhubung via {socialLabel(me.provider)}
        </span>
        <p className="mt-3 max-w-[300px] text-[11.5px] leading-relaxed text-white/45">{me.bio}</p>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Mengikuti", value: compact(followed.length) },
          { label: "Koin", value: compact(me.coins) },
          { label: "Gift terkirim", value: compact(spent) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-center">
            <p className="text-base font-extrabold">{stat.value}</p>
            <p className="text-[9.5px] uppercase tracking-wide text-white/40">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/wallet"
          className="rounded-2xl bg-gradient-to-br from-vibe-red to-[#7a5cff] px-4 py-3 text-center text-[12px] font-bold"
        >
          Top up koin
        </Link>
        <Link href="/live" className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center text-[12px] font-bold">
          Jelajahi live
        </Link>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold">Host yang kamu ikuti</h2>
        {followed.length === 0 ? (
          <EmptyState title="Belum mengikuti host" hint="Ikuti host dari feed agar siarannya muncul di sini." />
        ) : (
          <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {followed.map((stream) => (
              <li key={stream.id}>
                <Link href={`/live/${stream.id}`} className="flex items-center gap-3 px-4 py-3">
                  <Avatar avatar={stream.host.avatar} name={stream.host.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold">{stream.host.name}</p>
                    <p className="truncate text-[10px] text-white/40">
                      @{stream.host.handle} · {compact(stream.viewers)} penonton
                    </p>
                  </div>
                  <span className="rounded-full bg-vibe-red/20 px-2 py-1 text-[9px] font-bold text-vibe-red">LIVE</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[11px] text-white/45">
          Total koin masuk: <span className="font-semibold text-emerald-300">{gained.toLocaleString("id-ID")}</span>
        </p>
        <p className="mt-1 text-[11px] text-white/45">
          Total koin untuk gift: <span className="font-semibold text-vibe-red">{spent.toLocaleString("id-ID")}</span>
        </p>
      </section>

      <div className="mt-5">
        <LogoutButton />
      </div>

      <BottomNav />
    </main>
  );
}
