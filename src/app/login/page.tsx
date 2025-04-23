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
  const [emailError, setEmailError] = useState(""); // ✅ エラー文言
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("メールアドレスを入力してください");
      valid = false;
    } else if (!/^[\w.+-]+@[a-z\d.-]+\.[a-z]{2,}$/i.test(email)) {
      setEmailError("メールアドレスの形式が正しくありません");
      valid = false;
    }

    if (!password) {
      setPasswordError("パスワードを入力してください");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
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
        router.push(user.profileCompleted ? "/parent/parent-dashboard" : "/parent/setup");
      } else {
        router.push("/pending");
      }
    } catch (error) {
      alert("エラーが発生しました");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">ログイン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>

          <div>
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

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

