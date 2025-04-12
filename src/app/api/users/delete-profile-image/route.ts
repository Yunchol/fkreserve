import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, imageUrl } = body;

    if (!userId || !imageUrl) {
      return NextResponse.json({ error: "userId または imageUrl が不足しています" }, { status: 400 });
    }

    // 実ファイルを削除
    const filePath = path.join(process.cwd(), "public", imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // imageUrl を空に更新
    await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: "" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("画像削除エラー:", err);
    return NextResponse.json({ error: "画像削除に失敗しました" }, { status: 500 });
  }
}
