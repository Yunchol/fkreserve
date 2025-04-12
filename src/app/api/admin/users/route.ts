// ユーザー一覧取得（GET）

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // CookieからJWTを取得
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "未ログイン" }, { status: 401 });
    }

    // JWTを検証してuserIdを取得
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // ユーザーを取得してadminか確認
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 401 });
    }

    // 全ユーザー取得（✅ imageUrlを含めるように修正）
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        imageUrl: true, // ✅ ここを追加！
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("ユーザー一覧取得エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
