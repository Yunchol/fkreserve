import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // 重複チェック
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json({ error: "すでに登録されています" }, { status: 400 });
  }

  // ✅ パスワードをハッシュ化！
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ ハッシュ済みパスワードを保存
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "pending",
    },
  });

  return NextResponse.json({ message: "登録完了" });
}
