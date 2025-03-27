import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 401 });
  }

  // ハッシュなしのプレーンなパスワード照合
  if (user.password !== password) {
    return NextResponse.json({ error: "パスワードが間違っています" }, { status: 401 });
  }

  return NextResponse.json({
    message: "ログイン成功",
    role: user.role,
  });
  
}
