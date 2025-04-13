// src/app/api/admin/child/[childId]/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  const childId = context.params.childId;

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { name: true },
  });

  if (!child) {
    return NextResponse.json({ error: "子どもが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ name: child.name });
}
