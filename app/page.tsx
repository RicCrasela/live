import { redirect } from "next/navigation";
import Feed from "@/components/Feed";
import { getCurrentUser } from "@/lib/session";
import { listStreams, publicUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const me = publicUser(user);
  if (!me) redirect("/login");

  return (
    <Feed
      initialItems={listStreams(user.id, "foryou")}
      me={{ id: me.id, name: me.name, handle: me.handle, coins: me.coins, avatar: me.avatar }}
    />
  );
}
