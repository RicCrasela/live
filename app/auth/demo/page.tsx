import { redirect } from "next/navigation";
import DemoConsent from "@/components/DemoConsent";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DemoAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  const { provider } = await searchParams;
  const allowed = ["google", "facebook", "twitter", "tiktok"] as const;
  const picked = allowed.find((id) => id === provider) ?? "google";

  return <DemoConsent provider={picked} />;
}
