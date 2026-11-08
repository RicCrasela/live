import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { GIFTS, getStream, sendGift, userMap } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!getStream(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const giftId = typeof (body as { giftId?: unknown })?.giftId === "string" ? (body as { giftId: string }).giftId : "";
  const result = sendGift(id, user.id, giftId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const gift = GIFTS.find((g) => g.id === giftId);
  const users = userMap();
  return NextResponse.json({
    ok: true,
    balance: result.balance,
    gift,
    message: {
      id: `g_${Date.now()}`,
      streamId: id,
      userId: user.id,
      kind: "gift",
      text: `mengirim ${gift?.name ?? "gift"}`,
      giftId,
      coins: gift?.coins ?? 0,
      createdAt: Date.now(),
      user: users[user.id] ?? { name: user.name, handle: user.handle, avatar: user.avatar },
    },
  });
}
