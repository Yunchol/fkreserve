"use client";

import { useState } from "react";

export default function ParentSetupPage() {
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState([
    { name: "", birthday: "", gender: "", notes: "" },
  ]);

  const handleAddChild = () => {
    setChildren([...children, { name: "", birthday: "", gender: "", notes: "" }]);
  };

  const handleChangeChild = (index: number, field: string, value: string) => {
    const updated = [...children];
    updated[index][field as keyof typeof updated[number]] = value;
    setChildren(updated);
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/parent/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: parentName, children }),
    });

    if (res.ok) {
      // 完了後、ダッシュボードに遷移
      window.location.href = "/parent/parent-dashboard";
    } else {
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">プロフィール入力</h1>

      <div>
        <label>保護者の氏名：</label>
        <input
          type="text"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          className="border px-2 py-1 w-full"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">お子さま情報</h2>
        {children.map((child, index) => (
          <div key={index} className="border p-4 space-y-2 rounded">
            <input
              type="text"
              placeholder="名前"
              value={child.name}
              onChange={(e) => handleChangeChild(index, "name", e.target.value)}
              className="border px-2 py-1 w-full"
            />
            <input
              type="date"
              value={child.birthday}
              onChange={(e) => handleChangeChild(index, "birthday", e.target.value)}
              className="border px-2 py-1 w-full"
            />
            <select
              value={child.gender}
              onChange={(e) => handleChangeChild(index, "gender", e.target.value)}
              className="border px-2 py-1 w-full"
            >
              <option value="">性別を選択</option>
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="その他">その他</option>
            </select>
            <textarea
              placeholder="特記事項（任意）"
              value={child.notes}
              onChange={(e) => handleChangeChild(index, "notes", e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
        ))}

        <button onClick={handleAddChild} className="px-4 py-2 bg-blue-500 text-white rounded">
          お子さまを追加
        </button>
      </div>

      <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
        保存して完了
      </button>
    </div>
  );
}
