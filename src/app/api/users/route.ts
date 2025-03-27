// GET /api/users → ユーザー一覧取得
// POST /api/users → ユーザー新規作成

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body;

  const newUser = await prisma.user.create({
    data: { name, email, password },
  });

  return NextResponse.json(newUser);
}
