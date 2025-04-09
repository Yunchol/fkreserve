"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import InvoicePreview from "@/components/InvoicePreview";

export default function BillingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const childId = params.childId as string;
  const month = searchParams.get("month");

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [childName, setChildName] = useState("―");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId || !month) return;

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/admin/invoice?childId=${childId}&month=${month}`);
        const data = await res.json();

        if (data.invoice) {
          setInvoiceData(data.invoice);
          setIsFinalized(true);
          setNote(data.invoice.note || "");
        } else {
          const calcRes = await fetch(`/api/admin/invoice/calculate?childId=${childId}&month=${month}`);
          const calcData = await calcRes.json();
          const info = calcData.calculatedInvoice ?? calcData;
          setInvoiceData(info);
          setIsFinalized(false);
          setNote("");
        }
      } catch (err) {
        console.error("データ取得エラー", err);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    const fetchChildName = async () => {
      try {
        const res = await fetch(`/api/admin/child/${childId}`);
        const data = await res.json();
        setChildName(data.name || "名前未取得");
      } catch {
        setChildName("名前取得失敗");
      }
    };

    fetchInvoice();
    fetchChildName();
  }, [childId, month]);

  const handleFinalize = async () => {
    if (!invoiceData || !childId || !month) return;

    const total = calculateTotal(invoiceData); // 税込合計金額の再計算
    try {
      const res = await fetch("/api/admin/invoice/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          month,
          version: invoiceData.version,
          breakdown: invoiceData.breakdown,
          total,
          weeklyCount: invoiceData.weeklyCount,
          note,
        }),
      });

      if (!res.ok) throw new Error("請求確定に失敗しました");

      alert("請求を確定しました！");
      setIsFinalized(true);
    } catch (err) {
      alert("確定処理中にエラーが発生しました");
    }
  };

  const calculateTotal = (invoiceData: any) => {
    const basic = invoiceData.breakdown.basic?.unitPrice ?? 0;
    const spot = invoiceData.breakdown.spot?.quantity * invoiceData.breakdown.spot?.unitPrice || 0;
    const optionTotal = Object.values(invoiceData.breakdown.options ?? {}).reduce(
      (sum: number, option: any) => sum + option.quantity * option.unitPrice,
      0
    );
    const subtotal = basic + spot + optionTotal;
    return subtotal + Math.round(subtotal * 0.1);
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!invoiceData?.breakdown) return <p>データが見つかりませんでした。</p>;

  return (
    <div>
      <InvoicePreview
        invoiceId={invoiceData.id}
        childId={childId}
        childName={childName}
        month={month!}
        breakdown={invoiceData.breakdown}
        weeklyCount={invoiceData.weeklyCount}
        note={note}
        finalizedAt={invoiceData.finalizedAt}
        readonly={isFinalized}
        showPrintButton={isFinalized}
      />

      {/* 印刷時に非表示 */}
      <div className="mt-4 text-right no-print space-x-2">
        {!isFinalized && (
          <button
            onClick={handleFinalize}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            請求を確定する
          </button>
        )}
      </div>
    </div>
  );
}
