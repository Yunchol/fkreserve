// src/app/api/admin/billing/route.ts

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
  
      const childWhere: any = {};
      if (name) {
        childWhere.name = { contains: name };
      }
  
      const children = await prisma.child.findMany({
        where: childWhere,
      });
  
      if (month) {
        const start = new Date(`${month}-01`);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

        console.log(start)
        console.log(end)
  
        const basicUsages = await prisma.basicUsage.findMany({
          where: {
            month,
            childId: { in: children.map((c) => c.id) },
          },
          select: {
            childId: true,
          },
        });
  
        const activeChildIds = new Set(basicUsages.map((b) => b.childId));
  
        const invoices = await prisma.invoice.findMany({
          where: { month },
        });
  
        const result = children
          .filter((child) => activeChildIds.has(child.id))
          .map((child) => {
            const invoice = invoices.find((inv) => inv.childId === child.id);
            return {
              id: child.id,
              name: child.name,
              confirmed: !!invoice,
              total: invoice?.total ?? null,
            };
          });
  
        return NextResponse.json(result);
      }
  
      const result = children.map((child) => ({
        id: child.id,
        name: child.name,
        confirmed: false,
        total: null,
      }));
  
      return NextResponse.json(result);
  
    } catch (err) {
      console.error("❌ /api/admin/billing の取得エラー", err);
      return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
  }
  
