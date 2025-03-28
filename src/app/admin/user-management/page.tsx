'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("取得失敗");
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        console.error("ユーザー一覧取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      <h1>ユーザー管理</h1>
      <table>
        <thead>
          <tr>
            <th>名前</th>
            <th>メール</th>
            <th>ロール</th>
            <th>登録日</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{format(new Date(u.createdAt), "yyyy/MM/dd")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
