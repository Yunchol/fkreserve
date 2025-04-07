//自動計算結果を元に、正式な請求書としてDBに保存するAPI

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, month, version, breakdown, total } = body;

    if (!childId || !month || !version || !breakdown || total === undefined) {
      return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        childId,
        month,
        version,
        breakdown,
        total,
        finalizedAt: new Date(),
      },
    });

    return NextResponse.json(invoice);
  } catch (err) {
    console.error("❌ /api/admin/invoice/confirm POST エラー", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
