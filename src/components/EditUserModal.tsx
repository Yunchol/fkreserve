// src/components/EditUserModal.tsx
"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";


type Props = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // 保存後に親で再取得させる用
};

export default function EditUserModal({ user, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<User>(user);

  useEffect(() => {
    setFormData(user); // モーダルが開くたびに初期値更新
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      onSave();
      onClose();
    } else {
      alert("更新に失敗しました");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">ユーザー編集</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm">名前</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border w-full rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm">メール</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border w-full rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm">ロール</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border w-full rounded px-2 py-1"
            >
              <option value="admin">admin</option>
              <option value="staff">staff</option>
              <option value="parent">parent</option>
              {/* <option value="pending">pending</option> */}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-1 border rounded">
            キャンセル
          </button>
          <button onClick={handleSubmit} className="px-4 py-1 bg-blue-500 text-white rounded">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
