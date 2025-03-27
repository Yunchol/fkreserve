'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      const role = data.role;
  
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
    <div>
      <h1>ログイン</h1>
      <input
        type="text"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
}
