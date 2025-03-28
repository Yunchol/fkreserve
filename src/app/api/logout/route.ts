import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // ✅ Cookie（token）を削除
  (await
        // ✅ Cookie（token）を削除
        cookies()).delete("token");

  return NextResponse.json({ message: "ログアウトしました" });
}
