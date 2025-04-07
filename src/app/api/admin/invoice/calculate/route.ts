// app/api/admin/invoice/calculate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CalculatedInvoice {
  version: string;
  breakdown: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

async function calculateInvoice(childId: string, month: string): Promise<CalculatedInvoice> {
  // 最新の BillingSetting を取得
  const latestSetting = await prisma.billingSetting.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!latestSetting) {
    throw new Error("Billing setting not found");
  }

  // デバッグ用に console.log でも出力
  console.log("🛠️ Latest BillingSetting:", latestSetting);

  const basicPrices = latestSetting.basicPrices as Record<string, number>;
  const spotPrices = latestSetting.spotPrices as Record<string, number>;
  const optionPrices = latestSetting.optionPrices as Record<string, number>;

  // ※ 実際は DB から取得した利用情報で算出
  const weeklyUsage = 2;
  const spotUsageCount = 3;
  const lunchUsageCount = 1;

  const basicPrice = basicPrices[weeklyUsage.toString()] || 0;
  const spotPrice = spotPrices["morning"] || 0;
  const optionPrice = optionPrices["lunch"] || 0;

  console.log("基本りょうきn", basicPrice)

  const breakdown: InvoiceItem[] = [
    { description: "基本利用料金", quantity: 1, unitPrice: basicPrice },
    { description: "スポット利用料金", quantity: spotUsageCount, unitPrice: spotPrice },
    { description: "オプション料金（ランチ）", quantity: lunchUsageCount, unitPrice: optionPrice },
  ];

  const subtotal = breakdown.reduce(
    (sum: number, item: InvoiceItem) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return {
    version: latestSetting.version,
    breakdown,
    subtotal,
    tax,
    total,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    const month = searchParams.get("month");

    if (!childId || !month) {
      return NextResponse.json(
        { error: "childId と month は必須です" },
        { status: 400 }
      );
    }

    // ここで最新の BillingSetting も返すように一時的に取得
    const latestSetting = await prisma.billingSetting.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    const calculatedInvoice = await calculateInvoice(childId, month);

    // デバッグ用レスポンス: 設定と計算結果を両方返す
    return NextResponse.json({
      billingSetting: latestSetting,
      calculatedInvoice,
    });
  } catch (err) {
    console.error("❌ /api/admin/invoice/calculate GET エラー", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
