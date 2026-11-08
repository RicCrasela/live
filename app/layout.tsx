import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeLive — Livestreaming & sosial",
  description:
    "VibeLive adalah aplikasi livestreaming vertikal: tonton siaran live, kirim gift, dan masuk dengan akun Google, Facebook, X, atau TikTok.",
  applicationName: "VibeLive",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07070b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-[100dvh] bg-[#07070b] text-white antialiased">{children}</body>
    </html>
  );
}
