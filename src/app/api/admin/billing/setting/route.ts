import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";


export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // 🔸ここでDBからユーザー情報を取得して admin ロールか確認
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "管理者のみが実行可能です" }, { status: 403 });
    }

    const { version, basicPrices, spotPrices, optionPrices } = await req.json();

    if (!version || !basicPrices || !spotPrices || !optionPrices) {
      return NextResponse.json({ error: "パラメータ不足" }, { status: 400 });
    }

    const exists = await prisma.billingSetting.findFirst({ where: { version } });
    if (exists) {
      return NextResponse.json({ error: "このバージョン名はすでに存在します" }, { status: 409 });
    }

    await prisma.billingSetting.create({
      data: {
        version,
        basicPrices,
        spotPrices,
        optionPrices,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("料金設定エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function GET() {
    try {
      const all = await prisma.billingSetting.findMany({
        orderBy: { createdAt: "desc" },
      });
  
      const latest = all[0];
  
      return NextResponse.json({ latest, history: all });
    } catch (err) {
      console.error("料金設定取得エラー:", err);
      return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
  }