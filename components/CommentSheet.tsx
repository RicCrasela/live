"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./ui";
import { compact } from "@/lib/format";
import type { ChatMessage } from "@/lib/catalog";

export default function CommentSheet({
  streamId,
  onClose,
  onSent,
}: {
  streamId: string;
  onClose: () => void;
  onSent: (message: ChatMessage) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const cursor = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/streams/${streamId}/comments?after=${cursor.current}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { comments: ChatMessage[] };
        if (stop || !data.comments?.length) return;
        cursor.current = Math.max(cursor.current, ...data.comments.map((c) => c.createdAt));
        setMessages((prev) => [...prev, ...data.comments].slice(-120));
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        });
      } catch {
        /* jaringan sementara tidak tersedia */
      }
    };
    void load();
    const timer = setInterval(load, 3000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [streamId]);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/streams/${streamId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (res.ok) {
        const data = (await res.json()) as { comment: ChatMessage };
        setText("");
        cursor.current = Math.max(cursor.current, data.comment.createdAt);
        setMessages((prev) => [...prev, data.comment]);
        onSent(data.comment);
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Tutup komentar" />
      <div className="relative z-10 flex h-[68vh] w-full max-w-[480px] flex-col rounded-t-3xl border-t border-white/10 bg-[#14141b]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-sm font-bold">Komentar</p>
            <p className="text-[11px] text-white/45">{messages.length} pesan di ruang live</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            Tutup
          </button>
        </div>

        <div ref={listRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <p className="pt-8 text-center text-xs text-white/40">Jadilah yang pertama berkomentar 👋</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="flex gap-2.5">
              {m.user ? (
                <Avatar avatar={m.user.avatar} name={m.user.name} size={30} />
              ) : (
                <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-white/10 text-xs">💬</span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] text-white/45">@{m.user?.handle ?? "vibelive"}</p>
                <p className="break-words text-[13px] leading-snug text-white/90">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="safe-bottom flex items-center gap-2 border-t border-white/10 px-3 py-2.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
            placeholder="Tulis komentar..."
            maxLength={200}
            className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm outline-none placeholder:text-white/35 focus:bg-white/[0.14]"
          />
          <button
            onClick={() => void send()}
            disabled={!text.trim() || sending}
            className="rounded-full bg-vibe-red px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
