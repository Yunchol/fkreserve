// src/app/parent/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  const { selectedChildId  } = useChildStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMonth = searchParams.get("month");

  const selectedChild = children.find((c) => c.id === selectedChildId);

  useEffect(() => {
    const fetchChildrenAndInvoices = async () => {
      const res = await fetch("/api/parent/invoices");
      const data = await res.json();
      setChildren(data.children || []);
      if (selectedChildId) {
        const target = data.children.find((c: Child) => c.id === selectedChildId);
        setInvoices(target?.invoices || []);
      }
      setLoading(false);
    };

    fetchChildrenAndInvoices();
  }, [selectedChildId]);

  // 最新の請求書（月）を取得
  const latestMonth = invoices.length > 0 ? invoices[invoices.length - 1].month : null;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">請求書一覧</h1>

      <ChildSelector children={children} />

      {loading && <p>読み込み中...</p>}

      {!selectedChild && !loading && <p>子どもを選択してください。</p>}

      {selectedChild && !loading && invoices.length === 0 && (
        <p className="mt-4 text-gray-600">確定済みの請求書はまだありません。</p>
      )}

      {selectedChild && invoices.length > 0 && (
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
