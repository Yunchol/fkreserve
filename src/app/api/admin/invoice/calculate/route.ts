// src/app/api/admin/invoice/calculate/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const month = searchParams.get("month");

  if (!childId || !month) {
    return NextResponse.json({ error: "childId と month は必須です" }, { status: 400 });
  }

  try {
    // ① 最新の BillingSetting を取得
    const billingSetting = await prisma.billingSetting.findFirst({
      orderBy: { createdAt: "desc" }
    });

    if (!billingSetting) {
      return NextResponse.json({ error: "BillingSetting が見つかりません" }, { status: 500 });
    }

    // ② BasicUsage を取得（基本料金に必要）
    const basicUsage = await prisma.basicUsage.findUnique({
      where: {
        childId_month: {
          childId,
          month
        }
      }
    });

    // ③ スポット予約を取得（type: "spot"）
    const start = new Date(`${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const spotReservations = await prisma.reservation.findMany({
      where: {
        childId,
        type: "spot",
        date: { gte: start, lte: end }
      }
    });

    // ④ MonthlyOptionUsage を取得
    const optionUsages = await prisma.monthlyOptionUsage.findMany({
      where: { childId, month }
    });
    console.log("📦 optionUsages:", optionUsages); 

   // ⑤ 各料金を計算
    const weeklyCount = basicUsage?.weeklyCount || 0;

    // Prisma の Json 型に型アサーションを加えて扱いやすくする
    const basicPrices = billingSetting.basicPrices as Record<string, number>;
    const spotPrices = billingSetting.spotPrices as Record<string, number>;
    const optionPrices = billingSetting.optionPrices as Record<string, number>;

    // 基本料金（週利用回数に応じた単価）
    const basicPrice = basicPrices[String(weeklyCount)] ?? 0;

    // スポット料金（1日単価 × 利用回数）
    const spotCount = spotReservations.length;
    const spotUnit = spotPrices["full"] ?? 0;
    const spotTotal = spotCount * spotUnit;

    // オプションごとの内訳（{ type: { quantity, unitPrice } }）
    const optionBreakdown: Record<string, { quantity: number; unitPrice: number }> = {};

    for (const usage of optionUsages) {
      const unitPrice = optionPrices[usage.optionType] ?? 0;
      optionBreakdown[usage.optionType] = {
        quantity: usage.count,
        unitPrice
      };
    }

    // breakdown を組み立て
    const breakdown = {
      basic: { quantity: weeklyCount, unitPrice: basicPrice },
      spot: { quantity: spotCount, unitPrice: spotUnit },
      options: optionBreakdown
    };
    console.log(breakdown)

    // 合計金額の計算
    const optionTotal = Object.values(optionBreakdown).reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const subtotal = basicPrice + spotTotal + optionTotal;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    return NextResponse.json({
      version: billingSetting.version,
      breakdown,
      total,
      weeklyCount 
    });

  } catch (err) {
    console.error("❌ 請求計算エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
