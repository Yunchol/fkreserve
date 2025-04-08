// /api/children/[childId]/route.ts (例)

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { childId: string } }) {
  const child = await prisma.child.findUnique({
    where: { id: params.childId },
    select: { name: true },
  });

  if (!child) {
    return NextResponse.json({ error: "子どもが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ name: child.name });
}
