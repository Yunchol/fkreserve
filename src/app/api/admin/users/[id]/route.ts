//ユーザー削除（DELETE）
//ユーザー個別取得

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  await prisma.user.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "削除完了" });
}


export async function GET(_: Request, { params }: { params: { id: string } }) {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
  
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
  
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });
  
    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }
  
    return NextResponse.json({ user });
  }
