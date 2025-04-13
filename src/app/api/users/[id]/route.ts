// src/app/api/users/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ✅ ユーザー取得
export async function GET(req: NextRequest, context: any) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // 本人 or 管理者のみ取得可能
  if (!currentUser || (currentUser.id !== context.params.id && currentUser.role !== "admin")) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: context.params.id } });
  return NextResponse.json(user);
}

// ✅ ユーザー更新
export async function PUT(req: NextRequest, context: any) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // 本人 or 管理者のみ編集可能
  if (!currentUser || (currentUser.id !== context.params.id && currentUser.role !== "admin")) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id: context.params.id },
    data: body,
  });

  return NextResponse.json(updated);
}

// ✅ ユーザー削除
export async function DELETE(req: NextRequest, context: any) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // 管理者のみ削除可能
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const deleted = await prisma.user.delete({ where: { id: context.params.id } });
  return NextResponse.json(deleted);
}
