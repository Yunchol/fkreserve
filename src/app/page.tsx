"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react"; // アイコン付き！

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">学童管理アプリ</h1>
        <p className="text-gray-600 mb-6">保護者・スタッフ・管理者のためのポータルへようこそ。</p>

        <Button
          onClick={() => router.push("/login")}
          className="bg-black text-white hover:bg-gray-800 w-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          ログインする
        </Button>
      </div>
    </main>
  );
}
