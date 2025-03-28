'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-4">ユーザー管理</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        users.map((u) => (
          <Card key={u.id}>
            <CardHeader>
              <CardTitle>{u.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>メール：</strong>{u.email}</p>
              <p><strong>ロール：</strong>{u.role}</p>
              <p><strong>登録日：</strong>{format(new Date(u.createdAt), "yyyy/MM/dd")}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
