"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Beranda", icon: "M3 10.5 12 3l9 7.5V21H3v-10.5Z" },
  { href: "/live", label: "Live", icon: "M4 6h16v12H4zM8 10l6 3-6 3v-6Z" },
  { href: "/wallet", label: "Koin", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v10m3-7.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5S10.3 12 12 12s3 1.1 3 2.5S13.7 17 12 17" },
  { href: "/profile", label: "Profil", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c0-3.3 3.6-6 8-6s8 2.7 8 6" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="pointer-events-auto fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="safe-bottom flex items-center justify-around px-2 py-2">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-16 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium transition ${
                active ? "text-white" : "text-white/45 hover:text-white/70"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
