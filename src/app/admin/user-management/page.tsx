'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EditUserModal from "@/components/EditUserModal";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

// ロール表示に応じたスタイル
const getRoleStyle = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700";
    case "parent":
      return "bg-blue-100 text-blue-700";
    case "staff":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-gray-100 text-gray-700";
    default:
      return "";
  }
};

const roleLabels: { [key: string]: string } = {
  admin: "👑 管理者",
  parent: "👪 保護者",
  staff: "🧑‍🏫 スタッフ",
  pending: "⏳ 承認待ち",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoles, setExpandedRoles] = useState<{ [key: string]: boolean }>({
    admin: true,
    parent: true,
    staff: true,
    pending: true,
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("このユーザーを本当に削除しますか？");
    if (!confirm) return;

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchUsers();
    } else {
      alert("削除に失敗しました");
    }
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = (role: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const groupedUsers: { [key: string]: User[] } = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {} as { [key: string]: User[] });

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">ユーザー管理</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        Object.entries(roleLabels).map(([role, label]) => (
          <div key={role}>
            {/* 👇 見出し + トグルを横に並べる */}
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold">
                {label}（{groupedUsers[role]?.length ?? 0}人）
              </h2>
              <button
                onClick={() => toggleRole(role)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {expandedRoles[role] ? "▲" : "▼"}
              </button>
            </div>

            {/* ユーザー一覧カード */}
            {expandedRoles[role] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(groupedUsers[role] ?? []).map((u) => (
                  <Card key={u.id} className="h-full shadow-sm border">
                    <CardHeader className="flex justify-between items-start pb-2">
                      <div>
                        <CardTitle className="text-base font-semibold">{u.name}</CardTitle>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(u)}
                        >
                          編集
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleDelete(u.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="text-sm space-y-1 pt-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">ロール：</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getRoleStyle(u.role)}`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        登録日：{format(new Date(u.createdAt), "yyyy/MM/dd")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* 編集モーダル */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeEditModal}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}
