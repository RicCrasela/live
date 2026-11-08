import { notFound, redirect } from "next/navigation";
import LiveRoom from "@/components/LiveRoom";
import type { ChatMessage } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";
import { getFeedItem, listComments, publicUser, userMap } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LiveRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const item = getFeedItem(id, user.id);
  if (!item) notFound();

  const me = publicUser(user);
  if (!me) redirect("/login");

  const users = userMap();
  const initialComments: ChatMessage[] = listComments(id).map((comment) => ({
    id: comment.id,
    streamId: comment.streamId,
    userId: comment.userId,
    kind: comment.kind,
    text: comment.text,
    giftId: comment.giftId,
    coins: comment.coins,
    createdAt: comment.createdAt,
    user: users[comment.userId] ?? null,
  }));

  return (
    <LiveRoom
      item={item}
      me={{ id: me.id, name: me.name, handle: me.handle, coins: me.coins, avatar: me.avatar }}
      initialComments={initialComments}
    />
  );
}
