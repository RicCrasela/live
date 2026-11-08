"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { compact } from "@/lib/format";
import type { FeedItem } from "@/lib/store";
import type { ChatMessage, MeLite } from "@/lib/catalog";
import { Avatar, LivePill } from "./ui";
import BottomNav from "./BottomNav";
import CommentSheet from "./CommentSheet";
import GiftSheet from "./GiftSheet";

export default function Feed({ initialItems, me }: { initialItems: FeedItem[]; me: MeLite }) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [tab, setTab] = useState<"foryou" | "following">("foryou");
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [coins, setCoins] = useState(me.coins);
  const [sheet, setSheet] = useState<{ type: "comments" | "gift"; id: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const [loadingTab, setLoadingTab] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const videos = useRef<Array<HTMLVideoElement | null>>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      if (index === active) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [active, items]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el || !el.clientHeight) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index !== active && index >= 0 && index < items.length) setActive(index);
  };

  const switchTab = async (next: "foryou" | "following") => {
    if (next === tab || loadingTab) return;
    setTab(next);
    setLoadingTab(true);
    try {
      const res = await fetch(`/api/streams?tab=${next}`, { cache: "no-store" });
      const data = (await res.json()) as { items: FeedItem[] };
      setItems(data.items ?? []);
      setActive(0);
      scroller.current?.scrollTo({ top: 0 });
    } catch {
      notify("Gagal memuat feed");
    } finally {
      setLoadingTab(false);
    }
  };

  const like = async (id: string) => {
    setBurst((b) => b + 1);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, liked: !item.liked, likes: item.likes + (item.liked ? -1 : 1) }
          : item,
      ),
    );
    try {
      await fetch(`/api/streams/${id}/like`, { method: "POST" });
    } catch {
      notify("Like tidak tersimpan");
    }
  };

  const follow = async (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, following: !item.following } : item,
      ),
    );
    try {
      await fetch(`/api/streams/${id}/follow`, { method: "POST" });
    } catch {
      notify("Follow gagal");
    }
  };

  const share = async (id: string) => {
    const url = `${window.location.origin}/live/${id}`;
    try {
      if (navigator.share) await navigator.share({ title: "VibeLive", url });
      else await navigator.clipboard.writeText(url);
      notify("Tautan live disalin");
    } catch {
      notify("Tautan: " + url);
    }
  };

  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-[480px] overflow-hidden bg-black">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="feed-scroll no-scrollbar h-full w-full overflow-y-scroll"
      >
        {items.map((item, index) => (
          <section key={item.id} className="relative h-[100dvh] w-full snap-start overflow-hidden">
            <video
              ref={(el) => {
                videos.current[index] = el;
              }}
              src={item.video}
              muted={muted}
              loop
              playsInline
              autoPlay={index === 0}
              preload={index < 2 ? "auto" : "metadata"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />

            <div className="absolute left-4 top-20 flex items-center gap-2">
              <LivePill />
              <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
                👁 {compact(item.viewers)} penonton
              </span>
            </div>

            <div className="absolute bottom-[132px] right-2.5 flex flex-col items-center gap-4">
              <div className="relative">
                <Link href={`/live/${item.id}`} aria-label={`Buka live ${item.host.name}`}>
                  <Avatar avatar={item.host.avatar} name={item.host.name} size={48} ring live />
                </Link>
                {!item.following && (
                  <button
                    onClick={() => void follow(item.id)}
                    aria-label={`Ikuti ${item.host.name}`}
                    className="absolute -bottom-2 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full bg-vibe-red text-sm font-bold shadow-lg"
                  >
                    +
                  </button>
                )}
              </div>

              <button onClick={() => void like(item.id)} className="relative flex flex-col items-center gap-1">
                {burst > 0 && (
                  <span
                    key={burst}
                    className="pointer-events-none absolute -top-4 animate-floatUp text-2xl"
                    aria-hidden
                  >
                    ❤️
                  </span>
                )}
                <span className={`grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur ${item.liked ? "text-vibe-red" : "text-white"}`}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={item.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 20s-7-4.6-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[11px] font-semibold text-glow">{compact(item.likes)}</span>
              </button>

              <button
                onClick={() => setSheet({ type: "comments", id: item.id })}
                className="flex flex-col items-center gap-1"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4v8Z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 11h8M8 15h5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-[11px] font-semibold text-glow">{compact(item.comments)}</span>
              </button>

              <button
                onClick={() => setSheet({ type: "gift", id: item.id })}
                className="flex flex-col items-center gap-1"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-vibe-red text-xl shadow-lg">
                  🎁
                </span>
                <span className="text-[11px] font-semibold text-glow">Gift</span>
              </button>

              <button onClick={() => void share(item.id)} className="flex flex-col items-center gap-1">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-black/30 backdrop-blur">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 12v7h16v-7M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[11px] font-semibold text-glow">Bagikan</span>
              </button>
            </div>

            <div className="absolute bottom-[104px] left-4 right-[74px] space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-glow">@{item.host.handle}</p>
                <button
                  onClick={() => void follow(item.id)}
                  className={`rounded-full border px-2.5 py-[3px] text-[10px] font-bold transition ${
                    item.following
                      ? "border-white/30 text-white/70"
                      : "border-vibe-red bg-vibe-red/15 text-vibe-red"
                  }`}
                >
                  {item.following ? "Mengikuti" : "Ikuti"}
                </button>
              </div>
              <p className="line-clamp-2 text-[13px] leading-snug text-white/95 text-glow">{item.title}</p>
              <p className="text-[11px] font-medium text-vibe-cyan">
                #{item.tags.join(" #")} · {item.category}
              </p>
              <Link
                href={`/live/${item.id}`}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-vibe-red" />
                Gabung live room
              </Link>
            </div>

            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
              className="absolute bottom-[104px] right-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-sm backdrop-blur"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </section>
        ))}

        {items.length === 0 && (
          <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="text-4xl">📺</span>
            <p className="text-sm font-semibold">
              {tab === "following" ? "Belum ada host yang kamu ikuti" : "Belum ada siaran live"}
            </p>
            <p className="text-xs leading-relaxed text-white/50">
              {tab === "following"
                ? "Ikuti host favorit di feed Untuk Kamu, lalu siaran mereka muncul di sini."
                : "Coba muat ulang beberapa saat lagi."}
            </p>
            <button
              onClick={() => void switchTab("foryou")}
              className="mt-2 rounded-full bg-vibe-red px-4 py-2 text-xs font-semibold"
            >
              Jelajahi Untuk Kamu
            </button>
          </div>
        )}
      </div>

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-3">
        <div className="pointer-events-auto">
          <button onClick={() => void switchTab("foryou")} className="text-sm font-semibold text-white/80">
            <span className={tab === "foryou" ? "border-b-2 border-white pb-1 text-white" : ""}>Untuk Kamu</span>
          </button>
        </div>
        <div className="pointer-events-auto flex items-center gap-4">
          <button
            onClick={() => void switchTab("following")}
            className={`text-sm font-semibold ${tab === "following" ? "text-white" : "text-white/60"}`}
          >
            Mengikuti
          </button>
          <Link href="/live" aria-label="Jelajahi live" className="text-white/80">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </header>

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-40 -translate-x-1/2 animate-slideIn rounded-full bg-black/80 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur">
          {toast}
        </div>
      )}

      <BottomNav />

      {sheet?.type === "comments" && (
        <CommentSheet
          streamId={sheet.id}
          onClose={() => setSheet(null)}
          onSent={() =>
            setItems((prev) =>
              prev.map((item) => (item.id === sheet.id ? { ...item, comments: item.comments + 1 } : item)),
            )
          }
        />
      )}
      {sheet?.type === "gift" && (
        <GiftSheet
          streamId={sheet.id}
          balance={coins}
          onClose={() => setSheet(null)}
          onBalance={setCoins}
          onGift={(message, giftName, emoji) => {
            notify(`Kamu mengirim ${giftName} ${emoji}`);
            setItems((prev) =>
              prev.map((item) =>
                item.id === sheet.id ? { ...item, comments: item.comments + 1 } : item,
              ),
            );
            void message;
          }}
        />
      )}
    </div>
  );
}
