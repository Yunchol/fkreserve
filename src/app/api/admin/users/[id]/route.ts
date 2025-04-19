// /src/app/api/admin/users/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Next.js 15では、context.params が Promise になった！
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ← await が必要

  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "削除完了" });
}

// ✅ ユーザー取得
export async function GET(req: NextRequest, context: any) {
  const childId = context.params.id;

  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: childId },
  });

  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// ✅ ユーザー更新
export async function PATCH(req: NextRequest, context: any) {
  const childId = context.params.id;

  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { name, email, role, imageUrl } = await req.json();

  const updated = await prisma.user.update({
    where: { id: childId },
    data: {
      name,
      email,
      role,
      imageUrl,
    },
  });

  return NextResponse.json({ message: "更新成功", user: updated });
}
