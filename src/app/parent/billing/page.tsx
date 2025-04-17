"use client";

import { useEffect, useState } from "react";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Invoice = {
  id: string;
  month: string;
  total: number;
  finalizedAt: string;
};

type Child = {
  id: string;
  name: string;
};

export default function ParentBillingPage() {
  const { selectedChildId } = useChildStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMonth = searchParams.get("month");

  const selectedChild = children.find((c) => c.id === selectedChildId);

  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      try {
        const res = await fetch("/api/parent/invoices");
        const data = await res.json();
        setChildren(data.children || []);
      } catch (err) {
        console.error("子ども取得エラー:", err);
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;

    const fetchInvoices = async () => {
      setLoadingInvoices(true);
      try {
        const res = await fetch("/api/parent/invoices");
        const data = await res.json();
        const target = data.children.find((c: Child) => c.id === selectedChildId);
        setInvoices(target?.invoices || []);
      } catch (err) {
        console.error("請求取得エラー:", err);
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchInvoices();
  }, [selectedChildId]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">請求書一覧</h1>

      {/* ▼ 子どもセレクター + スピナー */}
      <div className="relative inline-block min-h-[44px] mb-4">
        {loadingChildren && (
           <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        )}
        <ChildSelector children={children} />
      </div>


      {/* ▼ 子ども未選択時 */}
      {!selectedChild && !loadingChildren && <p>子どもを選択してください。</p>}

      {/* ▼ 請求一覧ローディング */}
      {selectedChild && loadingInvoices && (
        <div className="relative min-h-[150px]">
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>請求書を読み込み中...</p>
            </div>
          </div>
        </div>
      )}


      {/* ▼ 請求一覧なし */}
      {selectedChild && !loadingInvoices && invoices.length === 0 && (
        <p className="mt-4 text-gray-600">確定済みの請求書はまだありません。</p>
      )}

      {/* ▼ 請求一覧表示 */}
      {selectedChild && invoices.length > 0 && !loadingInvoices && (
        <div className="mt-6 space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="border p-4 rounded shadow-sm bg-white">
              <p className="text-sm text-gray-600">
                <strong>対象月:</strong> {invoice.month}
              </p>
              <p className="text-sm text-gray-600">
                <strong>確定日:</strong>{" "}
                {new Date(invoice.finalizedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>合計:</strong> ¥{invoice.total.toLocaleString()}
              </p>
              <div className="mt-2">
                <Link
                  href={`/parent/billing/${selectedChild.id}?month=${invoice.month}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
