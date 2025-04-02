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
    if (!token) {
      return NextResponse.json({ error: "未ログイン" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    const userId = payload.userId;
    const body = await req.json();
    const { childId, date, type, options } = body;

    // ✅ 子どもがこのユーザーのものか確認
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child || child.parentId !== userId) {
      return NextResponse.json({ error: "不正な子どもID" }, { status: 403 });
    }

    // ✅ 同じ子どもに同じ日付の予約がすでにあるか確認
    const existing = await prisma.reservation.findFirst({
      where: {
        childId,
        date: new Date(date),
      },
    });

    if (existing) {
      return NextResponse.json({ error: "この日はすでに予約があります" }, { status: 409 });
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



  export async function PATCH(req: Request) {
    try {
      const token = (await cookies()).get("token")?.value;
      if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  
      const payload = verifyToken(token);
      if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });
  
      const userId = payload.userId;
      const body = await req.json();
      const { reservationId, newDate, type, options } = body;
  
      if (!reservationId) {
        return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
      }
  
      // ✅ ユーザー確認 & 所有チェック
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          child: true,
        },
      });
  
      if (!reservation || reservation.child.parentId !== userId) {
        return NextResponse.json({ error: "不正な予約ID" }, { status: 403 });
      }
  
      // ✅ 更新内容の組み立て
      const updateData: any = {};
      if (newDate) updateData.date = new Date(newDate);
      if (type) updateData.type = type;
      if (options) updateData.options = options;
  
      const updated = await prisma.reservation.update({
        where: { id: reservationId },
        data: updateData,
      });
  
      return NextResponse.json({ success: true, reservation: updated });
    } catch (err) {
      console.error("予約更新エラー:", err);
      return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
  }
  
  
  export async function DELETE(req: Request) {
    try {
      const token = (await cookies()).get("token")?.value;
      if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  
      const payload = verifyToken(token);
      if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });
  
      const userId = payload.userId;
      const body = await req.json();
      const { reservationId } = body;
  
      if (!reservationId) {
        return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
      }
  
      // 予約がこのユーザーの子どものものであるか確認
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { child: true },
      });
  
      if (!reservation || reservation.child.parentId !== userId) {
        return NextResponse.json({ error: "不正な予約ID" }, { status: 403 });
      }
  
      // 削除実行
      await prisma.reservation.delete({
        where: { id: reservationId },
      });
  
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("予約削除エラー:", err);
      return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
    }
  }
  