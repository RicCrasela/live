import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getFeedItem, getStream, listComments, touchPresence, userMap } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!getStream(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const user = await getCurrentUser();
  const existingVisitor = req.cookies.get("vibe_visitor")?.value;
  const visitor = existingVisitor ?? randomUUID();
  touchPresence(id, visitor);

  const after = Number(req.nextUrl.searchParams.get("after") ?? 0) || 0;
  const users = userMap();
  const item = getFeedItem(id, user?.id ?? null);

  const res = NextResponse.json({
    comments: listComments(id, after).map((c) => ({ ...c, user: users[c.userId] ?? null })),
    viewers: item?.viewers ?? 0,
    likes: item?.likes ?? 0,
    liked: item?.liked ?? false,
    following: item?.following ?? false,
    balance: user?.coins ?? 0,
  });

  if (!existingVisitor) {
    res.cookies.set("vibe_visitor", visitor, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return res;
}
