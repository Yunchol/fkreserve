import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // 重複チェック
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "すでに登録されています" }, { status: 400 });
  }

  // 仮登録（role: pending）
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password, // 今は平文、あとでbcryptに置き換える
      role: "pending",
    },
  });

  return NextResponse.json({ message: "仮登録成功" });
}
