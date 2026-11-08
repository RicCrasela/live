import { NextResponse } from "next/server";
import { providerStatus } from "@/lib/oauth";
import { getCurrentUser } from "@/lib/session";
import { COIN_PACKAGES, GIFTS, listTxns, publicUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: publicUser(user),
    txns: listTxns(user.id),
    gifts: GIFTS,
    packages: COIN_PACKAGES,
    providers: providerStatus(),
  });
}
