import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

  const userId = payload.userId;

  const children = await prisma.child.findMany({
    where: { parentId: userId },
    select: {
      id: true,
      name: true,
      invoices: {
        where: {
          finalizedAt: {},
        },
        orderBy: { month: "desc" },
        select: {
          id: true,
          month: true,
          total: true,
          finalizedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ children });
}
