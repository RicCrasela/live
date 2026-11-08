import Link from "next/link";
import { redirect } from "next/navigation";
import { providerStatus } from "@/lib/oauth";
import { getCurrentUser } from "@/lib/session";
import { Logo, SocialGlyph } from "@/components/ui";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  denied: "Kamu membatalkan proses login.",
  state: "Sesi login kedaluwarsa. Silakan coba lagi.",
  exchange: "Gagal memverifikasi akun sosial. Coba lagi.",
  provider: "Penyedia login tidak dikenal.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  const { error } = await searchParams;
  const providers = providerStatus();

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col justify-between px-6 pb-8 pt-12">
      <div>
        <Logo size={30} />
        <h1 className="mt-10 text-[30px] font-extrabold leading-tight tracking-tight">
          Siaran langsung,
          <br />
          <span className="bg-gradient-to-r from-vibe-cyan via-white to-vibe-red bg-clip-text text-transparent">
            langsung terasa.
          </span>
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-white/55">
          Tonton host favorit live, kirim gift, dan ngobrol realtime. Masuk dengan akun media sosialmu dalam sekali
          ketuk.
        </p>

        <div className="mt-8 space-y-2.5">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/api/auth/${provider.id}/start`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 transition hover:border-white/25 hover:bg-white/[0.09]"
            >
              <span className="flex items-center gap-3">
                <SocialGlyph id={provider.id} size={22} />
                <span className="text-[13px] font-semibold">Lanjutkan dengan {provider.label}</span>
              </span>
              <span className="flex items-center gap-2">
                {!provider.configured && (
                  <span className="rounded-full bg-white/10 px-2 py-[2px] text-[9px] font-bold uppercase tracking-wide text-white/60">
                    Demo
                  </span>
                )}
                <span className="text-white/30">→</span>
              </span>
            </Link>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-vibe-red/15 px-3.5 py-2.5 text-[11px] text-vibe-red">
            {ERRORS[error] ?? "Login gagal. Silakan coba lagi."}
          </p>
        )}

        <Link
          href="/auth/demo?provider=google"
          className="mt-5 block rounded-2xl bg-gradient-to-r from-vibe-red to-[#ff5f8f] py-3.5 text-center text-[13px] font-bold shadow-[0_16px_40px_-18px_rgba(254,44,85,0.9)]"
        >
          Masuk cepat sebagai tamu
        </Link>

        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/35">
          Login OAuth asli aktif otomatis begitu kredensial aplikasi (Google, Facebook, X, atau TikTok) diisi di
          environment server. Tanpa kredensial, alur berjalan dalam mode demo dengan profil tersimulasi.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        <div className="flex items-center justify-center gap-3 text-[10px] text-white/30">
          <span className="h-px w-10 bg-white/10" />
          6 host live sedang mengudara
          <span className="h-px w-10 bg-white/10" />
        </div>
        <p className="text-center text-[10px] text-white/30">
          Dengan melanjutkan kamu menyetujui Ketentuan Layanan & Kebijakan Privasi VibeLive.
        </p>
      </div>
    </main>
  );
}
