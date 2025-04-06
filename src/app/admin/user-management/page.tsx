'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EditUserModal from "@/components/EditUserModal";
import { User } from "@/types/user";

const getRoleStyle = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800 px-2 py-1 rounded";
    case "parent":
      return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
    case "staff":
      return "bg-green-100 text-green-800 px-2 py-1 rounded";
    case "pending":
      return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
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
    admin: false,
    parent: false,
    staff: false,
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
      fetchUsers(); // 最新の一覧を取得
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
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold mb-4">ユーザー管理</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        Object.entries(roleLabels).map(([role, label]) => (
          <div key={role}>
            <button
              onClick={() => toggleRole(role)}
              className="text-lg font-bold mb-2 w-full text-left"
            >
              {label}（{groupedUsers[role]?.length ?? 0}人）{" "}
              <span>{expandedRoles[role] ? "▲" : "▼"}</span>
            </button>

            {expandedRoles[role] && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {(groupedUsers[role] ?? []).map((u) => (
      <Card key={u.id} className="h-full">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>{u.name}</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(u)}
              className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(u.id)}
              className="text-sm px-2 py-1 bg-red-500 text-white rounded"
            >
              削除
            </button>
          </div>
        </CardHeader>

        <CardContent className="text-sm space-y-1">
          <p><strong>メール：</strong>{u.email}</p>
          <p>
            <strong>ロール：</strong>
            <span className={getRoleStyle(u.role)}>{u.role}</span>
          </p>
          <p><strong>登録日：</strong>{format(new Date(u.createdAt), "yyyy/MM/dd")}</p>
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
          onSave={fetchUsers} // 更新したら一覧を再取得
        />
      )}
    </div>
  );
}
