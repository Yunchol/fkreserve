'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ ローディング状態
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = async () => {
    setIsLoading(true); // ✅ ローディング開始
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        alert("ログイン失敗！");
        return;
      }

      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      const user = meData.user;

      if (!user) {
        alert("ユーザー情報の取得に失敗しました");
        return;
      }

      setUser(user);

      if (user.role === "admin") {
        router.push("/admin/admin-dashboard");
      } else if (user.role === "staff") {
        router.push("/staff/staff-dashboard");
      } else if (user.role === "parent") {
        if (!user.profileCompleted) {
          router.push("/parent/setup");
        } else {
          router.push("/parent/parent-dashboard");
        }
      } else {
        router.push("/pending");
      }
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsLoading(false); // ✅ ローディング終了
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">ログイン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>

          <div className="text-center mt-4 text-sm text-gray-600">
            アカウントをお持ちでない方は{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              新規登録はこちら
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
