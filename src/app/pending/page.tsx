"use client";
import { useRouter } from "next/navigation";


export default function PendingPage() {

  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

    return (
      <div>
        <h1>承認待ち</h1>
        <p>現在、管理者による承認待ちです。しばらくお待ちください。</p>
        <button onClick={handleLogout}>ログアウト</button>
      </div>
    );
  }
  