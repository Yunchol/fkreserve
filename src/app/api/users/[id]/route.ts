// src/app/api/users/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // 本人 or 管理者のみ取得可能
  if (!currentUser || (currentUser.id !== params.id && currentUser.role !== "admin")) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  return NextResponse.json(user);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // 本人 or 管理者のみ編集可能
  if (!currentUser || (currentUser.id !== params.id && currentUser.role !== "admin")) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // 管理者のみ削除可能
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const deleted = await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json(deleted);
}
