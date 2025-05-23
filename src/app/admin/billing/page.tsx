"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DatePicker from "react-datepicker"; // ← カレンダーコンポーネント
import { ja } from "date-fns/locale"; // ← 日本語ロケール対応
import "react-datepicker/dist/react-datepicker.css"; // ← カレンダーCSS
import { Calendar } from "lucide-react";



type BillingEntry = {
  id: string;
  name: string;
  month: string; // ← 追加
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isSearchDisabled = !selectedMonth && !searchName;

  useEffect(() => {
    if (selectedDate) {
      const formatted = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`;
      setSelectedMonth(formatted); // 既存の検索ロジックでそのまま使えるように
    }
  }, [selectedDate]);
  

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
      setBillingList(data); // ← month付きで返ってくる想定
    } catch (err) {
      setError("一覧の取得に失敗しました");
      setBillingList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (childId: string, month: string) => {
    router.push(`/admin/billing/${childId}?month=${month}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ページ右上に追加ボタン */}
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">請求管理（管理者用）</h1>
      <Button onClick={() => router.push("/admin/billing/setting")}>
        料金設定
      </Button>
    </div>


      {/* 🔹 検索フィルター */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">請求対象の月</label>
          <div className="relative w-48">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM"
              showMonthYearPicker
              locale={ja}
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm"
              calendarClassName="custom-datepicker"
              placeholderText="年月を選択"
            />
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
          </div>
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
      <div className="mt-4 relative min-h-[150px]">
        <h2 className="text-lg font-semibold mb-2">
          検索結果（{selectedMonth || "全期間"}）
        </h2>

        {/* 読み込み中のスピナー */}
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">読み込み中...</p>
            </div>
          </div>
        ) : billingList.length === 0 ? (
          <p className="text-gray-600">該当する請求が見つかりませんでした。</p>
        ) : (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left border-b">名前</th>
                  <th className="px-4 py-2 text-left border-b">請求月</th>
                  <th className="px-4 py-2 text-right border-b">合計金額</th>
                  <th className="px-4 py-2 text-center border-b">状態</th>
                  <th className="px-4 py-2 text-center border-b">操作</th>
                </tr>
              </thead>
              <tbody>
                {billingList.map((child) => (
                  <tr key={`${child.id}-${child.month}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{child.name}</td>
                    <td className="px-4 py-2 border-b">{child.month}</td>
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
                        onClick={() => handleDetailClick(child.id, child.month)}
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
