//指定された childId と month に対応する請求書が既に存在するかどうかを確認するAPI

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    const month = searchParams.get("month");

    if (!childId || !month) {
      return NextResponse.json({ error: "childId と month は必須です" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { childId, month },
    });

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("❌ /api/admin/invoice GET エラー", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
