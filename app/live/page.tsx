import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Avatar, EmptyState, LivePill, Logo } from "@/components/ui";
import { compact, timeAgo } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { listStreams } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LiveDirectoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const streams = listStreams(user.id, "foryou");

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-[520px] px-4 pb-28 pt-6">
      <div className="flex items-center justify-between">
        <Logo size={24} />
        <Link href="/" className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
          Tonton feed
        </Link>
      </div>

      <h1 className="mt-6 text-xl font-extrabold">Sedang live sekarang</h1>
      <p className="mt-1 text-[11px] text-white/45">{streams.length} host mengudara · update realtime</p>

      <div className="mt-4 space-y-3">
        {streams.length === 0 ? (
          <EmptyState title="Belum ada yang live" hint="Coba lagi beberapa saat lagi." />
        ) : (
          streams.map((stream) => (
            <Link
              key={stream.id}
              href={`/live/${stream.id}`}
              className="relative block overflow-hidden rounded-3xl border border-white/10 p-4"
              style={{
                background: `linear-gradient(135deg, ${stream.host.avatar.from}, ${stream.host.avatar.to})`,
              }}
            >
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative flex items-center gap-3">
                <Avatar avatar={stream.host.avatar} name={stream.host.name} size={52} ring />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <LivePill />
                    <span className="text-[10px] font-semibold text-white/75">👁 {compact(stream.viewers)}</span>
                  </div>
                  <p className="mt-1 truncate text-[13px] font-bold">{stream.title}</p>
                  <p className="truncate text-[10.5px] text-white/60">
                    {stream.host.name} · {stream.category} · mulai {timeAgo(stream.startedAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold">Masuk →</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
