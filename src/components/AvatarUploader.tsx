"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

type Props = {
  userId: string;
  imageUrl: string;
  onUploadComplete: (url: string) => void;
  onDeleteComplete: () => void;
};

export default function AvatarUploader({
  userId,
  imageUrl,
  onUploadComplete,
  onDeleteComplete,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const sanitizeFileName = (name: string) => {
    return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
  };

  const handleUpload = async (file: File) => {
    const safeFileName = sanitizeFileName(file.name);
    const filePath = `${userId}/${Date.now()}_${safeFileName}`;

    setUploading(true);
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });
    setUploading(false);

    if (error) {
      alert("アップロード失敗: " + error.message);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (publicData?.publicUrl) {
      onUploadComplete(publicData.publicUrl);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async () => {
    if (!imageUrl) return;

    const path = imageUrl.split("/avatars/")[1]; // Supabase内のパスだけ取り出す
    if (!path) {
      alert("削除対象のパスが不明です");
      return;
    }

    const { error } = await supabase.storage.from("avatars").remove([path]);
    if (error) {
      alert("削除に失敗しました");
      return;
    }

    onDeleteComplete();
  };

  return (
    <div className="flex flex-col items-center space-y-2">
  <div className="relative w-24 h-24 mb-1">
    {imageUrl ? (
      <>
        <img
          src={imageUrl}
          alt="プロフィール画像"
          className="w-24 h-24 object-cover rounded-full border"
        />
        <button
          type="button"
          onClick={handleDelete}
          className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100"
        >
          <X className="w-4 h-4 text-red-600" />
        </button>
      </>
    ) : (
      <div className="w-24 h-24 rounded-full border bg-gray-100" />
    )}
  </div>

  {/* {!imageUrl && (
    <p className="text-xs text-gray-500 -mt-1">プロフィール画像が未設定です</p>
  )} */}

  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:underline">
    画像を選択
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      disabled={uploading}
      className="hidden"
    />
  </label>

  {uploading && <p className="text-xs text-gray-500">アップロード中...</p>}
</div>


  );
  
}
