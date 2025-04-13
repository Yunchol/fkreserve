import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase client 作成（server-side用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json({ error: "ファイルまたはユーザーIDがありません" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Supabaseにアップロード
  const { data, error } = await supabase.storage
    .from("user-images") // ← ここはStorageバケット名
    .upload(fileName, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "アップロード失敗" }, { status: 500 });
  }

  // 画像のパブリックURL取得
  const { data: publicUrl } = supabase
    .storage
    .from("user-images")
    .getPublicUrl(fileName);

  // DBに保存（Userに imageUrl カラムがある前提）
  await prisma.user.update({
    where: { id: userId },
    data: { imageUrl: publicUrl.publicUrl },
  });

  return NextResponse.json({ success: true, imageUrl: publicUrl.publicUrl });
}
