import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { listStreams } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const tab = req.nextUrl.searchParams.get("tab") === "following" ? "following" : "foryou";
  return NextResponse.json({ items: listStreams(user?.id ?? null, tab) });
}
