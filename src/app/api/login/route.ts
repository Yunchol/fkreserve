import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { generateToken } from "@/lib/auth";


export async function POST(req: Request) {
  const { email, password } = await req.json();

  // ユーザー検索
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 401 });
  }

  // ✅ パスワードの照合（compare）
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "パスワードが間違っています" }, { status: 401 });
  }

  // ✅ JWT発行
  const token = generateToken(user.id);

  // ✅ Cookieに保存
    (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1週間
  });

  
return NextResponse.json({
  message: "ログイン成功",
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

}
