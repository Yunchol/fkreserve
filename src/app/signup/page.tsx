'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("仮登録が完了しました。承認をお待ちください。");
      router.push("/login");
    } else {
      const data = await res.json();
      alert(`エラー: ${data.error}`);
    }
  };

  return (
    <div>
      <h1>サインアップ</h1>
      <input placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>登録</button>
    </div>
  );
}
