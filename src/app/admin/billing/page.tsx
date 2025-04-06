"use client";

import { useState } from "react";
import { format } from "date-fns";

export default function BillingPage() {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    format(new Date(), "yyyy-MM")
  );
  const [searchName, setSearchName] = useState("");

  // 仮データ
  const dummyChildren = [
    { id: "1", name: "さくらちゃん", total: 75800 },
    { id: "2", name: "たろうくん", total: 64000 },
    { id: "3", name: "はなこちゃん", total: 87000 },
  ];

  const filtered = dummyChildren.filter((child) =>
    child.name.includes(searchName)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold mb-4">請求管理（管理者用）</h1>

      {/* 🔹 月選択 */}
      <div>
        <label className="block font-medium mb-1">請求対象の月</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded p-2 w-full max-w-xs"
        />
      </div>

      {/* 🔹 子ども検索 */}
      <div>
        <label className="block font-medium mb-1">子どもを検索</label>
        <input
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="名前で検索..."
          className="border rounded p-2 w-full max-w-xs"
        />
      </div>

      {/* 🔹 請求リスト（仮） */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">請求一覧（{selectedMonth}）</h2>
        {filtered.length === 0 ? (
          <p>該当する子どもがいません</p>
        ) : (
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">名前</th>
                <th className="border px-4 py-2 text-right">合計金額</th>
                <th className="border px-4 py-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((child) => (
                <tr key={child.id}>
                  <td className="border px-4 py-2">{child.name}</td>
                  <td className="border px-4 py-2 text-right">
                    ¥{child.total.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button className="text-blue-600 hover:underline text-sm">詳細</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
