"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react"; // ← アイコン（任意）

export default function LogoutButton() {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      clearUser();
      router.push("/login");
    } catch (err) {
      console.error("ログアウトに失敗しました", err);
      alert("ログアウトに失敗しました");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="default"
      className="text-red-600 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      ログアウト
    </Button>
  );
}
