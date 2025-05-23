'use client';

import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/stores/userStore";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth(["parent"]);
  const { user } = useUserStore();
  const router = useRouter();

  // ✅ ロールを日本語に変換するマップ
  const roleLabels: Record<string, string> = {
    parent: "保護者"
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "parent")) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "parent") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>認証確認中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
        {/* 左側：ユーザー名 */}
        <div className="text-default text-gray-700">
          ようこそ、<span className="font-semibold">{user.name}</span> さん（{roleLabels[user.role] ?? user.role}）
        </div>

        {/* 右側：ナビボタン */}
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push("/parent/reservations")}
          >
            予約管理
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push("/parent/billing")}
          >
            請求確認
          </Button>
          <LogoutButton />
        </div>
      </header>

      <main className="pt-24 px-4 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
