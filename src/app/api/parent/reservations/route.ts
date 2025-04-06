import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationOption } from "@/types/reservation";
import { convertArrayToOptions, convertOptionsToArray } from "@/lib/utils/convertOption"; 

// GET: 予約一覧取得（親の子どもと予約すべて）
export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "未ログイン" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });

    const userId = payload.userId;

    // options リレーションも含める
    const childrenWithReservations = await prisma.child.findMany({
      where: { parentId: userId },
      include: {
        reservations: {
          orderBy: { date: "asc" },
          include: { options: true },
        },
      },
    });

    // 各予約の options を配列から ReservationOption 型へ変換
    const transformed = childrenWithReservations.map(child => ({
      ...child,
      reservations: child.reservations.map(reservation => ({
        ...reservation,
        options: convertArrayToOptions(reservation.options),
      })),
    }));

    return NextResponse.json({ children: transformed });
  } catch (err) {
    console.error("予約取得エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// ✅ POST: 単体 or 一括登録（BasicUsage付き）
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

    const userId = payload.userId;
    const body = await req.json();
    const { childId, date, type, options, reservations, basicUsage, month } = body;

    // ✅ 子どもの所有者チェック
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== userId) {
      return NextResponse.json({ error: "不正な子どもID" }, { status: 403 });
    }

    // ✅ 一括登録（+ BasicUsage の保存）
    if (Array.isArray(reservations)) {
      if (!month || !basicUsage) {
        return NextResponse.json({ error: "月情報または利用プランが不足しています" }, { status: 400 });
      }

      // 一括トランザクションで保存（既存予約は削除 → 上書き）
      await prisma.$transaction([
        // ① 既存予約削除（同月）
        prisma.reservation.deleteMany({
          where: {
            childId,
            date: {
              gte: new Date(`${month}-01`),
              lt: new Date(`${month}-31`) // 仮：月末日（うるう年・末日は後で調整してもOK）
            }
          }
        }),
        // ② BasicUsage 上書き（upsert）
        prisma.basicUsage.upsert({
          where: {
            childId_month: {
              childId,
              month
            }
          },
          update: {
            weeklyCount: basicUsage.weeklyCount,
            weekdays: basicUsage.weekdays
          },
          create: {
            childId,
            month,
            weeklyCount: basicUsage.weeklyCount,
            weekdays: basicUsage.weekdays
          }
        }),
        // ③ 新しい予約をすべて登録
        ...reservations.map((r) =>
          prisma.reservation.create({
            data: {
              childId,
              date: new Date(r.date),
              type: r.type,
              options: {
                create: r.options.map((opt: any) => ({
                  type: opt.type,
                  count: opt.count,
                  time: opt.time || null,
                  lessonName: opt.lessonName || null,
                }))
              }
            }
          })
        )
      ]);

      return NextResponse.json({ success: true });
    }

    // ✅ 単体登録
    if (!date || !type || !Array.isArray(options)) {
      return NextResponse.json({ error: "パラメータ不足" }, { status: 400 });
    }

    const exists = await prisma.reservation.findFirst({
      where: { childId, date: new Date(date) },
    });

    if (exists) {
      return NextResponse.json({ error: "この日はすでに予約があります" }, { status: 409 });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        childId,
        date: new Date(date),
        type,
        options: {
          create: options.map((opt: any) => ({
            type: opt.type,
            count: opt.count,
            time: opt.time || null,
            lessonName: opt.lessonName || null,
          })),
        },
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
    const { reservationId, newDate, type, options } = await req.json();

    if (!reservationId)
      return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { child: true },
    });

    if (!reservation || reservation.child.parentId !== userId) {
      return NextResponse.json({ error: "不正な予約ID" }, { status: 403 });
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        ...(newDate && { date: new Date(newDate) }),
        ...(type && { type }),
        ...(options && {
          // 既存のオプションをすべて削除してから、新たに作成する
          options: {
            deleteMany: {},
            create: convertOptionsToArray(options),
          },
        }),
      },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err) {
    console.error("予約更新エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

// ✅ DELETE: 単体 or 来月分一括削除
export async function DELETE(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

    const userId = payload.userId;
    const { reservationId, childId, month } = await req.json();

    // ✅ 単体削除
    if (reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { child: true },
      });

      if (!reservation || reservation.child.parentId !== userId) {
        return NextResponse.json({ error: "不正な予約ID" }, { status: 403 });
      }

      await prisma.reservation.delete({ where: { id: reservationId } });
      return NextResponse.json({ success: true });
    }

    // ✅ 一括削除（月単位）
    if (childId && month) {
      const child = await prisma.child.findUnique({ where: { id: childId } });
      if (!child || child.parentId !== userId) {
        return NextResponse.json({ error: "不正な子どもID" }, { status: 403 });
      }

      const start = new Date(`${month}-01`);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

      await prisma.reservation.deleteMany({
        where: {
          childId,
          date: { gte: start, lte: end },
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "削除条件が不正です" }, { status: 400 });
  } catch (err) {
    console.error("予約削除エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
