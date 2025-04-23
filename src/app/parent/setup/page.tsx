"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";


type Child = {
  name: string;
  birthday: string;
  gender: string;
  notes: string;
};

export default function ParentSetupPage() {
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState<Child[]>([
    { name: "", birthday: "", gender: "", notes: "" },
  ]);
  const [errors, setErrors] = useState<string[][]>([]); // 各子どもごとのエラーリスト
  const [parentNameError, setParentNameError] = useState(""); // ← 追加
  const [isSubmitting, setIsSubmitting] = useState(false); // ← 追加



  const handleAddChild = () => {
    setChildren([...children, { name: "", birthday: "", gender: "", notes: "" }]);
  };

  const handleRemoveChild = (index: number) => {
    if (children.length <= 1) return;
    setChildren(children.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  const handleChangeChild = (index: number, field: keyof Child, value: string) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const validate = (): boolean => {
    let isValid = true;
    setParentNameError("");
  
    if (!parentName.trim()) {
      setParentNameError("保護者の氏名は必須です");
      isValid = false;
    }
  
    const newErrors: string[][] = children.map((child) => {
      const childErrors: string[] = [];
      if (!child.name.trim()) childErrors.push("名前は必須です");
      if (!child.birthday.trim()) childErrors.push("生年月日は必須です");
      if (!child.gender.trim()) childErrors.push("性別は必須です");
      return childErrors;
    });
  
    setErrors(newErrors);
    if (!newErrors.every((e) => e.length === 0)) isValid = false;
  
    return isValid;
  };
  

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
  
    setIsSubmitting(true); // 🔄 送信中
  
    try {
      const res = await fetch("/api/parent/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: parentName, children }),
      });
  
      if (res.ok) {
        window.location.href = "/parent/parent-dashboard";
      } else {
        alert("保存に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    } finally {
      setIsSubmitting(false); // ✅ 完了後に戻す（保険）
    }
  };
  

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">保護者プロフィール入力</h1>

      <div className="space-y-2">
        <Label htmlFor="parent-name">保護者の氏名</Label>
        <Input
          id="parent-name"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
        />
        {parentNameError && (
          <p className="text-red-500 text-sm mt-1">{parentNameError}</p>
        )}
      </div>


      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">お子さま情報</h2>
        {children.map((child, index) => (
          <Card key={index} className="relative p-4 space-y-4">
            {children.length > 1 && (
              <button
                onClick={() => handleRemoveChild(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="この入力欄を削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="space-y-1">
              <Label htmlFor={`name-${index}`}>名前</Label>
              <Input
                id={`name-${index}`}
                value={child.name}
                onChange={(e) => handleChangeChild(index, "name", e.target.value)}
              />
              {errors[index]?.includes("名前は必須です") && (
                <p className="text-red-500 text-sm mt-1">名前は必須です</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor={`birthday-${index}`}>生年月日</Label>
              <Input
                id={`birthday-${index}`}
                type="date"
                value={child.birthday}
                onChange={(e) => handleChangeChild(index, "birthday", e.target.value)}
              />
              {errors[index]?.includes("生年月日は必須です") && (
                <p className="text-red-500 text-sm mt-1">生年月日は必須です</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor={`gender-${index}`}>性別</Label>
              <select
                id={`gender-${index}`}
                value={child.gender}
                onChange={(e) => handleChangeChild(index, "gender", e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded w-full"
              >
                <option value="">選択してください</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="その他">その他</option>
              </select>
              {errors[index]?.includes("性別は必須です") && (
                <p className="text-red-500 text-sm mt-1">性別は必須です</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor={`notes-${index}`}>特記事項 <span className="text-gray-400 text-sm">(任意)</span></Label>
              <Textarea
                id={`notes-${index}`}
                placeholder="例：アレルギーや送迎希望など"
                value={child.notes}
                onChange={(e) => handleChangeChild(index, "notes", e.target.value)}
              />
            </div>
          </Card>
        ))}

        <Button
          onClick={handleAddChild}
          className="border bg-gray-50 text-gray-800 hover:border-gray-400 hover:bg-gray-50 text-gray-800 transition"
        >
          ＋ 新しい子どもの入力欄を追加
        </Button>

      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            送信中...
          </span>
        ) : (
          "保存して完了"
        )}
      </Button>
    </div>
  );
}
