// src/app/api/admin/invoice/finalize/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      childId,
      month,
      breakdown,
      total,
      version,
      weeklyCount,
      note, // ✅ 備考も受け取る
    } = await req.json();

    if (!childId || !month || !breakdown || !version || total == null) {
      return NextResponse.json({ error: "必要なパラメータが不足しています" }, { status: 400 });
    }

    const finalizedAt = new Date();

    const invoice = await prisma.invoice.upsert({
      where: {
        childId_month: {
          childId,
          month,
        },
      },
      update: {
        breakdown,
        total,
        version,
        finalizedAt,
        note,          // ✅ 備考を保存
        weeklyCount,   // ✅ 基本料金の表示にも使う
      },
      create: {
        childId,
        month,
        breakdown,
        total,
        version,
        finalizedAt,
        note,
        weeklyCount,
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (err) {
    console.error("請求書確定エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
