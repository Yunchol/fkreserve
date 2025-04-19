// src/app/api/parent/invoice/route.ts
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

  const userId = payload.userId;
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const month = searchParams.get("month");

  if (!childId || !month) {
    return NextResponse.json({ error: "childIdとmonthは必須です" }, { status: 400 });
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { parentId: true, name: true }, // ← `name` を取得
  });

  if (!child || child.parentId !== userId) {
    return NextResponse.json({ error: "アクセス権がありません" }, { status: 403 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      childId_month: {
        childId,
        month,
      },
    },
  });

  return NextResponse.json({
    invoice,
    childName: child.name, // ← ここで一緒に返す！
  });
}
