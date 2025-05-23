'use client';

import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/stores/userStore";
import LogoutButton from "@/components/LogoutButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth(["staff"]);
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "staff")) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>認証確認中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="text-sm md:text-base text-gray-700 font-medium">
          ようこそ、<span className="font-semibold">{user.name}</span> さん（{user.role}）
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-screen-md mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-6">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
