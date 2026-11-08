"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-semibold text-white/70 transition hover:border-vibe-red/40 hover:text-vibe-red disabled:opacity-50"
    >
      {loading ? "Keluar..." : "Keluar dari akun"}
    </button>
  );
}
