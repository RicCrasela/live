import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getStream, toggleFollow } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const stream = getStream(id);
  if (!stream) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(toggleFollow(stream.hostId, user.id));
}
