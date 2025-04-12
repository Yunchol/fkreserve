// app/api/users/upload-profile-image/route.ts
import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

// appDirではbodyのstream処理が必要
export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("file") as File;
  const userId = data.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json({ error: "file または userId がありません" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(process.cwd(), "public/uploads", filename);
  const imageUrl = `/uploads/${filename}`;

  await fs.promises.writeFile(filepath, buffer);

  // DBに保存（UserにimageUrlを追加している前提）
  await prisma.user.update({
    where: { id: userId },
    data: { imageUrl },
  });

  return NextResponse.json({ success: true, imageUrl });
}


