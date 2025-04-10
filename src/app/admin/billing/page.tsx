"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const handleDetailClick = (childId: string) => {
    router.push(`/admin/billing/${childId}?month=${selectedMonth}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">請求管理（管理者用）</h1>

      {/* 🔹 検索フィルター */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">請求対象の月</label>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">子どもを検索</label>
          <Input
            type="text"
            placeholder="名前で検索..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-64"
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          className="mt-1"
        >
          検索する
        </Button>
      </div>

      {/* 🔹 エラー表示 */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* 🔹 結果表示 */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">
          検索結果（{selectedMonth || "全期間"}）
        </h2>

        {loading ? (
          <p>読み込み中...</p>
        ) : billingList.length === 0 ? (
          <p className="text-gray-600">該当する請求が見つかりませんでした。</p>
        ) : (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left border-b">名前</th>
                  <th className="px-4 py-2 text-right border-b">合計金額</th>
                  <th className="px-4 py-2 text-center border-b">状態</th>
                  <th className="px-4 py-2 text-center border-b">操作</th>
                </tr>
              </thead>
              <tbody>
                {billingList.map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{child.name}</td>
                    <td className="px-4 py-2 text-right border-b">
                      {child.confirmed && child.total !== null
                        ? `¥${child.total.toLocaleString()}`
                        : "―"}
                    </td>
                    <td className="px-4 py-2 text-center border-b">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          child.confirmed
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {child.confirmed ? "✅ 確定済み" : "⏳ 未確定"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center border-b">
                      <button
                        onClick={() => handleDetailClick(child.id)}
                        className="text-blue-600 hover:underline"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
