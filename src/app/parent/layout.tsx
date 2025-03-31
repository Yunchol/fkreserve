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
            <Button variant="outline" onClick={() => router.push("/parent/parent-dashboard")}>お知らせ</Button>
            <Button variant="outline" onClick={() => router.push("/parent/reservations")}>予約管理</Button>
            <Button variant="outline" onClick={() => router.push("/parent/billing")}>請求確認</Button>
            <Button variant="outline" onClick={() => router.push("/parent/profile")}>プロフィール</Button>
          </div>
  
          <LogoutButton />
        </header>
  
        <main className="mx-auto pt-24 px-4">
          {children}
        </main>
      </div>
    );
}
