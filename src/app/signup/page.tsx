'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // ← 追加！
  const router = useRouter();

  const validate = () => {
    if (!name || !email || !password) {
      return "すべての項目を入力してください";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "正しいメールアドレスを入力してください";
    }
    if (password.length < 6) {
      return "パスワードは6文字以上で入力してください";
    }
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true); // ← 開始！

    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false); // ← 完了！

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "登録に失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">新規登録</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Input
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            disabled={loading}
            onClick={handleSignup}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            登録
          </Button>

          <div className="text-center mt-4 text-sm text-gray-600">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              ログインはこちら
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
