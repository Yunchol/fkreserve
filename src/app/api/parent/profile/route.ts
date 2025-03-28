import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    // JWTからログインユーザー取得
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!currentUser || currentUser.role !== "parent") {
      return NextResponse.json({ error: "保護者のみが登録できます" }, { status: 403 });
    }

    const { name, children } = await req.json();

    // 保護者名を更新 & profileCompleted: true にする
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        profileCompleted: true,
      },
    });

    // 子ども情報を一括登録（全員分）
    const createdChildren = await Promise.all(
      children.map((child: any) =>
        prisma.child.create({
          data: {
            name: child.name,
            birthday: new Date(child.birthday),
            gender: child.gender,
            notes: child.notes,
            parentId: currentUser.id,
          },
        })
      )
    );

    return NextResponse.json({ message: "登録完了", children: createdChildren });
  } catch (err) {
    console.error("プロフィール登録エラー:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
