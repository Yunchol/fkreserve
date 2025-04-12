"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Pencil, Trash2, X, ImagePlus } from "lucide-react"; 

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

  const handleImageDelete = async () => {
    if (!formData.imageUrl) return;
  
    try {
      const res = await fetch("/api/users/delete-profile-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageUrl: formData.imageUrl,
        }),
      });
  
      const result = await res.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
      } else {
        alert("削除に失敗しました");
      }
    } catch (err) {
      console.error("削除エラー:", err);
      alert("画像削除中にエラーが発生しました");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-in fade-in">
        <h2 className="text-xl font-bold mb-4 text-gray-800">ユーザー編集</h2>

        <div className="space-y-4">
          {/* プロフィール画像 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              プロフィール画像
            </label>

            {formData.imageUrl ? (
              <div className="relative w-24 h-24 mb-2">
                <img
                  src={formData.imageUrl}
                  alt="プロフィール画像"
                  className="w-24 h-24 object-cover rounded-full border"
                />
                {/* 削除ボタン */}
                <button
                  type="button"
                  onClick={handleImageDelete} // ← これに変更！
                  className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>

              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-2">画像が未設定です</p>
            )}

            {/* アップロードボタン */}
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:underline">
              <ImagePlus className="w-4 h-4" />
              画像を選択
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploading && (
              <p className="text-xs text-gray-500 mt-1">アップロード中...</p>
            )}
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
