"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BillingEntry = {
  id: string;
  name: string;
  total: number | null;
  confirmed: boolean;
};

export default function BillingPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchName, setSearchName] = useState("");
  const [billingList, setBillingList] = useState<BillingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSearchDisabled = !selectedMonth && !searchName;

  const handleSearch = async () => {
    if (isSearchDisabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.append("month", selectedMonth);
      if (searchName) params.append("name", searchName);

      const res = await fetch(`/api/admin/billing?${params.toString()}`);
      if (!res.ok) throw new Error("データ取得に失敗しました");

      const data = await res.json();
      setBillingList(data);
    } catch (err) {
      setError("一覧の取得に失敗しました");
      setBillingList([]);
    } finally {
      setLoading(false);
    }
  };

  // 詳細ボタン押下時のハンドラー
  const handleDetailClick = (childId: string) => {
    // URL の month は必ず選択されている前提で渡す
    router.push(`/admin/billing/${childId}?month=${selectedMonth}`);
  };

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

      {/* 🔹 検索ボタン */}
      <div>
        <button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          className={`px-4 py-2 rounded ${
            isSearchDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          検索する
        </button>
      </div>

      {/* 🔹 エラー表示 */}
      {error && <p className="text-red-600">{error}</p>}

      {/* 🔹 請求リスト */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">
          検索結果（{selectedMonth || "全期間"}）
        </h2>
        {loading ? (
          <p>読み込み中...</p>
        ) : billingList.length === 0 ? (
          <p>該当する請求が見つかりませんでした</p>
        ) : (
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">名前</th>
                <th className="border px-4 py-2 text-right">合計金額</th>
                <th className="border px-4 py-2 text-center">状態</th>
                <th className="border px-4 py-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {billingList.map((child) => (
                <tr key={child.id}>
                  <td className="border px-4 py-2">{child.name}</td>
                  <td className="border px-4 py-2 text-right">
                    {child.confirmed && child.total !== null
                      ? `¥${child.total.toLocaleString()}`
                      : "―"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {child.confirmed ? "✅ 確定済み" : "⏳ 未確定"}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleDetailClick(child.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      詳細
                    </button>
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
