"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/stores/userStore";
import LogoutButton from "@/components/LogoutButton"; // ← 共通ボタンを読み込む

export default function AdminDashboard() {
  const { loading } = useAuth(["admin"]);
  const { user } = useUserStore();

  if (loading) return <p>読み込み中...</p>;
  if (!user) return null;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>ようこそ、{user.name}さん（{user.role}）</p>
      <LogoutButton /> 
    </div>
  );
}
