"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import AvatarUploader from "@/components/AvatarUploader";
import { Loader2 } from "lucide-react";

// Supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export default function EditUserModal({ user, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<User>({
    ...user,
    imageUrl: user.imageUrl ?? "",
  });
  const [isSaving, setIsSaving] = useState(false); // 🔄 保存中ローディング状態

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

  const handleSubmit = async () => {
    setIsSaving(true); // 🔄 開始

    try {
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
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました");
    } finally {
      setIsSaving(false); // ✅ 終了
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-in fade-in">
        <h2 className="text-xl font-bold mb-4 text-gray-800">ユーザー編集</h2>

        <div className="space-y-4">
          {/* プロフィール画像 */}
          <div className="flex justify-center">
            <AvatarUploader
              userId={user.id}
              imageUrl={formData.imageUrl ?? ""}
              onUploadComplete={(url) => {
                setFormData((prev) => ({ ...prev, imageUrl: url }));
              }}
              onDeleteComplete={() => {
                setFormData((prev) => ({ ...prev, imageUrl: "" }));
              }}
            />
          </div>

          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border w-full rounded px-3 py-2 text-sm"
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
              className="border w-full rounded px-3 py-2 text-sm"
            />
          </div>

          {/* ロール */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">権限</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border w-full rounded px-3 py-2 text-sm"
            >
              <option value="pending">⏳ 承認待ち</option>
              <option value="admin">👑 管理者</option>
              <option value="staff">🧑‍🏫 スタッフ</option>
              <option value="parent">👪 保護者</option>
            </select>
          </div>
        </div>

        {/* ボタン群 */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </span>
            ) : (
              "保存"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
