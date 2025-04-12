"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export default function EditUserModal({ user, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<User>({ ...user, imageUrl: user.imageUrl ?? "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData({
      ...user,
      imageUrl: user.imageUrl ?? "",
      role: user.role || "pending",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("userId", user.id);

    setUploading(true);
    try {
      const res = await fetch("/api/users/upload-profile-image", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } catch {
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-in fade-in">
        <h2 className="text-xl font-bold mb-4 text-gray-800">ユーザー編集</h2>

        <div className="space-y-4">
          {/* プロフィール画像 */}
          <div className="text-center">
            <div className="relative inline-block">
              <label className="cursor-pointer group">
                <div className="w-28 h-28 rounded-full overflow-hidden border shadow">
                  {uploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    </div>
                  ) : formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="プロフィール画像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      画像なし
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-blue-600 group-hover:underline">
                  画像を変更する
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* メール */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メール</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* ロール */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ロール</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border w-full rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="pending">⏳ pending（未設定）</option>
              <option value="admin">👑 admin</option>
              <option value="staff">🧑‍🏫 staff</option>
              <option value="parent">👪 parent</option>
            </select>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </div>
      </div>
    </div>
  );
}
