import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { addComment, getStream, listComments, userMap } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const after = Number(req.nextUrl.searchParams.get("after") ?? 0) || 0;
  const users = userMap();
  return NextResponse.json({
    comments: listComments(id, after).map((c) => ({ ...c, user: users[c.userId] ?? null })),
  });
}

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
  const text = typeof (body as { text?: unknown })?.text === "string" ? (body as { text: string }).text : "";
  const comment = addComment(id, user.id, text);
  if (!comment) return NextResponse.json({ error: "empty" }, { status: 400 });

  return NextResponse.json({
    comment: {
      ...comment,
      user: { name: user.name, handle: user.handle, avatar: user.avatar },
    },
  });
}
