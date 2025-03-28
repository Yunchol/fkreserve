//ロール変更（PATCH）

// src/app/api/admin/users/[id]/role/route.ts

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { role } = await req.json();

  // roleのバリデーション
  const validRoles = ["admin", "parent", "staff", "pending"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "無効なロール" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role },
  });

  return NextResponse.json({ message: "ロール変更完了", user: updated });
}
