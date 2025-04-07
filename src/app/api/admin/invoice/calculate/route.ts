//指定された子どもと月の情報を元に、請求書の自動計算結果（内訳、合計金額など）を返すAPI

// app/api/admin/invoice/calculate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 上記の calculateInvoice 関数をインポートまたは定義する
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

// 仮の calculateInvoice 関数（実際は利用情報なども考慮）
function calculateInvoice(childId: string, month: string): CalculatedInvoice {
  // ※ 以下は先ほどの例と同じ
  const weeklyUsage = 2;
  const spotUsageCount = 3;
  const lunchUsageCount = 1;
  const basicPrice = billingSettingData.latest.basicPrices[weeklyUsage] || 0;
  const spotPrice = billingSettingData.latest.spotPrices.morning;
  const optionPrice = billingSettingData.latest.optionPrices.lunch;
  const breakdown: InvoiceItem[] = [
    { description: "基本利用料金", quantity: 1, unitPrice: basicPrice },
    { description: "スポット利用料金", quantity: spotUsageCount, unitPrice: spotPrice },
    { description: "オプション料金（ランチ）", quantity: lunchUsageCount, unitPrice: optionPrice }
  ];
  const subtotal = breakdown.reduce(
    (sum: number, item: InvoiceItem) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  return {
    version: billingSettingData.latest.version,
    breakdown,
    subtotal,
    tax,
    total
  };
}

// BillingSetting のサンプルデータ（実際は DB から取得するなど）
const billingSettingData = {
  latest: {
    id: "cm95fupxw000xg32jfgvfu3a7",
    version: "2025春back",
    basicPrices: { "0": 0, "1": 50000, "2": 55000, "3": 60000, "4": 65000, "5": 70000 },
    spotPrices: { morning: 4000, afternoon: 5000, full: 8000 },
    optionPrices: { lunch: 600, dinner: 600, school_car: 500, home_car: 500, lesson_car: 500 },
    createdAt: "2025-04-06T09:26:49.556Z",
    updatedAt: "2025-04-06T09:26:49.556Z"
  },
  history: []
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    const month = searchParams.get("month");

    if (!childId || !month) {
      return NextResponse.json({ error: "childId と month は必須です" }, { status: 400 });
    }

    const calculatedInvoice = calculateInvoice(childId, month);
    return NextResponse.json(calculatedInvoice);
  } catch (err) {
    console.error("❌ /api/admin/invoice/calculate GET エラー", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

