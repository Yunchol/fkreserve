import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const name = searchParams.get("name");

    if (!month && !name) {
      return NextResponse.json({ error: "検索条件が必要です" }, { status: 400 });
    }

    // 🔹 条件に合う子どもを取得
    const childWhere: any = {};
    if (name) {
      childWhere.name = { contains: name };
    }

    const children = await prisma.child.findMany({ where: childWhere });
    const childIds = children.map((c) => c.id);

    // 🔹 月指定あり：その月に basicUsage がある子のみ返す
    if (month) {
      const [basicUsages, invoices] = await Promise.all([
        prisma.basicUsage.findMany({
          where: {
            month,
            childId: { in: childIds },
          },
          select: {
            childId: true,
          },
        }),
        prisma.invoice.findMany({
          where: {
            month,
            childId: { in: childIds },
          },
        }),
      ]);

      const activeChildIds = new Set(basicUsages.map((b) => b.childId));

      const result = children
        .filter((child) => activeChildIds.has(child.id)) // ✅ basicUsage がある子だけ表示
        .map((child) => {
          const invoice = invoices.find((inv) => inv.childId === child.id);
          return {
            id: child.id,
            name: child.name,
            month,
            confirmed: !!invoice,
            total: invoice?.total ?? null,
          };
        });

      return NextResponse.json(result);
    }

    // 🔹 月指定なし（名前のみ検索）: 請求確定月 + 未確定月をすべて返す
    const [invoices, basicUsages] = await Promise.all([
      prisma.invoice.findMany({
        where: { childId: { in: childIds } },
        orderBy: { month: "desc" },
      }),
      prisma.basicUsage.findMany({
        where: { childId: { in: childIds } },
        orderBy: { month: "desc" },
      }),
    ]);

    const confirmedKeys = new Set(invoices.map((i) => `${i.childId}-${i.month}`));

    const invoiceResults = invoices.map((inv) => {
      const child = children.find((c) => c.id === inv.childId);
      return {
        id: child!.id,
        name: child!.name,
        month: inv.month,
        confirmed: true,
        total: inv.total,
      };
    });

    const basicResults = basicUsages
      .filter((b) => !confirmedKeys.has(`${b.childId}-${b.month}`)) // 未確定のみ
      .map((b) => {
        const child = children.find((c) => c.id === b.childId);
        return {
          id: child!.id,
          name: child!.name,
          month: b.month,
          confirmed: false,
          total: null,
        };
      });

    return NextResponse.json([...invoiceResults, ...basicResults]);
  } catch (err) {
    console.error("❌ /api/admin/billing の取得エラー", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
