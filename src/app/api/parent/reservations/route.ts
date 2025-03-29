// src/app/api/parent/reservations/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

    const userId = payload.userId;

    // ✅ 親ユーザーに紐づく子ども＋その予約を取得
    const childrenWithReservations = await prisma.child.findMany({
      where: { parentId: userId },
      include: {
        reservations: {
          orderBy: { date: "asc" }, // 日付順に並べる（お好みで）
        },
      },
    });

    return NextResponse.json({ children: childrenWithReservations });
  } catch (err) {
    console.error("予約取得エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
      const token = (await cookies()).get("token")?.value;
      if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  
      const payload = verifyToken(token);
      if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });
  
      const userId = payload.userId;
      const body = await req.json();
  
      const { childId, date, type, options } = body;
  
      // ✅ childIdがこのユーザーの子どもかチェック
      const child = await prisma.child.findUnique({
        where: { id: childId },
      });
  
      if (!child || child.parentId !== userId) {
        return NextResponse.json({ error: "不正な子どもID" }, { status: 403 });
      }
  
      // ✅ 予約作成
      const newReservation = await prisma.reservation.create({
        data: {
          childId,
          date: new Date(date),
          type,
          options,
        },
      });
  
      return NextResponse.json({ reservation: newReservation });
    } catch (err) {
      console.error("予約登録エラー:", err);
      return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
  }