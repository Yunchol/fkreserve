'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore"; // ✅ Zustand storeを読み込む
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser); // ✅ ZustandのsetUserを取得

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user); // ✅ ここでZustandにuser保存！

      const role = data.user.role;

      if (role === "admin") {
        router.push("/admin/admin-dashboard");
      } else if (role === "staff") {
        router.push("/staff/staff-dashboard");
      } else if (role === "parent") {
        router.push("/parent/parent-dashboard");
      } else if (role === "pending") {
        router.push("/pending");
      }
    } else {
      alert("ログイン失敗！");
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
          <Button className="w-full" onClick={handleLogin}>
            ログイン
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
