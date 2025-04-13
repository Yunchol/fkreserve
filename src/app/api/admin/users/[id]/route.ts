//ユーザー削除（DELETE）
//ユーザー個別取得

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const deleted = await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "削除完了" });
}


export async function GET(_: Request, { params }: { params: { id: string } }) {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
  
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
  
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });
  
    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }
  
    return NextResponse.json({ user });
  }

  export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
  
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }
  
    // 👇 imageUrl も受け取る
    const { name, email, role, imageUrl } = await req.json();
  
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        role,
        imageUrl, // 👈 ここを追加！
      },
    });
  
    return NextResponse.json({ message: "更新成功", user: updated });
  }
  

  //注意
//   このコードには認証も認可も入っていないので、
// 誰でも（ログインしてない人でも）
// 他人のIDを入れれば（adminじゃなくても）
// 他人のアカウントを見れる / 消せる / 書き換えられる
// という 超危険な状態になる！