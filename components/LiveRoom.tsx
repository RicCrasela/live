"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { compact } from "@/lib/format";
import type { FeedItem } from "@/lib/store";
import type { ChatMessage, MeLite } from "@/lib/catalog";
import { Avatar, LivePill } from "./ui";
import GiftSheet from "./GiftSheet";
import CommentSheet from "./CommentSheet";

type OverlayGift = { key: string; emoji: string; name: string; sender: string };

export default function LiveRoom({
  item,
  me,
  initialComments,
}: {
  item: FeedItem;
  me: MeLite;
  initialComments: ChatMessage[];
}) {
  const [comments, setComments] = useState<ChatMessage[]>(initialComments);
  const [viewers, setViewers] = useState(item.viewers);
  const [likes, setLikes] = useState(item.likes);
  const [liked, setLiked] = useState(item.liked);
  const [following, setFollowing] = useState(item.following);
  const [coins, setCoins] = useState(me.coins);
  const [text, setText] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [overlays, setOverlays] = useState<OverlayGift[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const cursor = useRef(initialComments.length ? Math.max(...initialComments.map((c) => c.createdAt)) : 0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    let stopped = false;

    const pushGifts = (messages: ChatMessage[]) => {
      const gifts = messages.filter((m) => m.kind === "gift" && m.giftId);
      if (!gifts.length) return;
      const next = gifts.map((g) => ({
        key: g.id,
        emoji: g.giftId === "lion" ? "🦁" : g.giftId === "crown" ? "👑" : g.giftId === "rocket" ? "🚀" : g.giftId === "wave" ? "👋" : g.giftId === "donut" ? "🍩" : "🌹",
        name: g.text.replace("mengirim ", ""),
        sender: g.user?.name ?? "Penonton",
      }));
      setOverlays((prev) => [...prev, ...next].slice(-4));
      setTimeout(() => {
        setOverlays((prev) => prev.filter((o) => !next.some((n) => n.key === o.key)));
      }, 2800);
    };

    const tick = async () => {
      try {
        const res = await fetch(`/api/streams/${item.id}/live?after=${cursor.current}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          comments: ChatMessage[];
          viewers: number;
          likes: number;
          liked: boolean;
          following: boolean;
        };
        if (stopped) return;
        setViewers(data.viewers);
        setLikes(data.likes);
        setLiked(data.liked);
        setFollowing(data.following);
        if (data.comments?.length) {
          cursor.current = Math.max(cursor.current, ...data.comments.map((c) => c.createdAt));
          setComments((prev) => [...prev, ...data.comments].slice(-120));
          pushGifts(data.comments);
        }
      } catch {
        /* koneksi sementara terputus */
      }
    };

    void tick();
    const timer = setInterval(tick, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [item.id]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    try {
      const res = await fetch(`/api/streams/${item.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (res.ok) {
        const data = (await res.json()) as { comment: ChatMessage };
        cursor.current = Math.max(cursor.current, data.comment.createdAt);
        setComments((prev) => [...prev, data.comment]);
      } else {
        notify("Komentar gagal dikirim");
      }
    } catch {
      notify("Koneksi bermasalah");
    }
  };

  const like = async () => {
    setLiked((v) => !v);
    setLikes((v) => v + (liked ? -1 : 1));
    try {
      await fetch(`/api/streams/${item.id}/like`, { method: "POST" });
    } catch {
      notify("Like tidak tersimpan");
    }
  };

  const follow = async () => {
    setFollowing((v) => !v);
    try {
      await fetch(`/api/streams/${item.id}/follow`, { method: "POST" });
    } catch {
      notify("Follow gagal");
    }
  };

  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-[480px] overflow-hidden bg-black">
      <video src={item.video} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/90" />

      <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-2 px-3 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Keluar dari live"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/40 text-lg backdrop-blur"
          >
            ✕
          </Link>
          <Avatar avatar={item.host.avatar} name={item.host.name} size={38} ring />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-glow">{item.host.name}</p>
            <p className="truncate text-[10px] text-white/60">
              @{item.host.handle} · {compact(item.host.followers)} pengikut
            </p>
          </div>
          <button
            onClick={() => void follow()}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
              following ? "bg-white/15 text-white/80" : "bg-vibe-red text-white"
            }`}
          >
            {following ? "Mengikuti" : "Ikuti"}
          </button>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            <LivePill />
            <span className="rounded-full bg-black/45 px-2 py-1 text-[10px] font-semibold backdrop-blur">
              👁 {compact(viewers)}
            </span>
          </div>
          <span className="rounded-full bg-amber-400/20 px-2 py-1 text-[10px] font-bold text-amber-300">
            🪙 {coins.toLocaleString("id-ID")}
          </span>
        </div>
      </header>

      <div className="pointer-events-none absolute bottom-[86px] left-0 right-0 z-10 px-3">
        <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
          🎁 Gift masuk ke host secara langsung
        </div>
        <div className="max-h-[34vh] space-y-1.5 overflow-hidden">
          {comments.slice(-8).map((m) => (
            <div
              key={m.id}
              className={`w-fit max-w-[86%] rounded-2xl px-2.5 py-1.5 text-[11.5px] leading-snug backdrop-blur ${
                m.kind === "gift" ? "bg-amber-400/25 text-amber-100" : "bg-black/40 text-white/95"
              }`}
            >
              {m.user ? (
                <>
                  <span className="font-semibold text-vibe-cyan">@{m.user.handle}</span>{" "}
                  <span>{m.text}</span>
                </>
              ) : (
                <span>{m.text}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-2">
        {overlays.map((g) => (
          <div
            key={g.key}
            className="animate-giftPop rounded-2xl border border-amber-300/40 bg-black/50 px-4 py-2 text-center backdrop-blur"
          >
            <p className="text-3xl">{g.emoji}</p>
            <p className="text-[11px] font-semibold text-amber-200">
              {g.sender} → {g.name}
            </p>
          </div>
        ))}
      </div>

      {toast && (
        <div className="absolute left-1/2 top-20 z-40 -translate-x-1/2 animate-slideIn rounded-full bg-black/80 px-4 py-2 text-xs font-medium backdrop-blur">
          {toast}
        </div>
      )}

      <div className="safe-bottom absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-white/10 bg-black/45 px-3 py-2.5 backdrop-blur-xl">
        <button
          onClick={() => setCommentOpen(true)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm"
          aria-label="Buka komentar"
        >
          💬
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          placeholder="Komentari live ini..."
          maxLength={200}
          className="min-w-0 flex-1 rounded-full bg-white/10 px-3.5 py-2.5 text-[13px] outline-none placeholder:text-white/35 focus:bg-white/[0.15]"
        />
        <button onClick={() => void send()} disabled={!text.trim()} className="shrink-0 rounded-full bg-vibe-red px-3.5 py-2.5 text-xs font-bold disabled:opacity-40">
          Kirim
        </button>
        <button
          onClick={() => setGiftOpen(true)}
          aria-label="Kirim gift"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-vibe-red text-lg shadow-lg"
        >
          🎁
        </button>
        <button onClick={() => void like()} aria-label="Suka live" className="flex shrink-0 flex-col items-center">
          <span className={`text-lg ${liked ? "animate-heartbeat" : ""}`}>{liked ? "❤️" : "🤍"}</span>
          <span className="text-[9px] font-semibold text-white/70">{compact(likes)}</span>
        </button>
      </div>

      {commentOpen && (
        <CommentSheet
          streamId={item.id}
          onClose={() => setCommentOpen(false)}
          onSent={(message) => setComments((prev) => [...prev, message])}
        />
      )}
      {giftOpen && (
        <GiftSheet
          streamId={item.id}
          balance={coins}
          onClose={() => setGiftOpen(false)}
          onBalance={setCoins}
          onGift={(message, name, emoji) => {
            setComments((prev) => [...prev, message]);
            const key = `local_${Date.now()}`;
            setOverlays((prev) => [...prev, { key, emoji, name, sender: me.name }].slice(-4));
            setTimeout(() => setOverlays((prev) => prev.filter((o) => o.key !== key)), 2800);
          }}
        />
      )}
    </div>
  );
}
