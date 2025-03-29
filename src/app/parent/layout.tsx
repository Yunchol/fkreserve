'use client';

import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/stores/userStore";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth(["parent"]);
  const { user } = useUserStore();
  const router = useRouter();

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow px-6 py-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="text-sm md:text-base text-gray-700 font-medium">
          ようこそ、<span className="font-semibold">{user.name}</span> さん（{user.role}）
        </div>
        <Button variant="outline" onClick={() => router.push("/parent/reservations")}>予約管理</Button>
          <Button variant="outline" onClick={() => router.push("/parent/profile")}>プロフィール管理</Button>
          <Button variant="outline" onClick={() => router.push("/parent/billing")}>請求確認</Button>
          <Button variant="outline" onClick={() => router.push("/parent/announcements")}>お知らせ</Button>
        <LogoutButton />
      </header>

      <main className="max-w-screen-md mx-auto pt-24 px-4">

        <Card>
          <CardContent className="py-6">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
