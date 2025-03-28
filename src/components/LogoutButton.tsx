"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

export default function LogoutButton() {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }); // CookieのJWT削除
      clearUser();                                     // Zustandのuserを初期化
      router.push("/login");                           // ログイン画面に戻る
    } catch (err) {
      console.error("ログアウトに失敗しました", err);
    }
  };

  return (
    <button onClick={handleLogout}>
      ログアウト
    </button>
  );
}
