"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function BillingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const childId = params.childId;
  const month = searchParams.get("month");

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isFinalized, setIsFinalized] = useState(false);
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
        } else {
          const calcRes = await fetch(`/api/admin/invoice/calculate?childId=${childId}&month=${month}`);
          const calcData = await calcRes.json();
          setInvoiceData(calcData.calculatedInvoice ?? calcData);
          setIsFinalized(false);
        }
      } catch (err) {
        console.error("データ取得エラー", err);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [childId, month]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!invoiceData?.breakdown) return <p>データが見つかりませんでした。</p>;

  const { breakdown } = invoiceData;

  const items: InvoiceItem[] = [
    {
      description: "基本利用料金",
      quantity: breakdown.basic?.quantity ?? 0,
      unitPrice: breakdown.basic?.unitPrice ?? 0,
    },
    {
      description: "スポット利用料金",
      quantity: breakdown.spot?.quantity ?? 0,
      unitPrice: breakdown.spot?.unitPrice ?? 0,
    },
    ...Object.entries(breakdown.options ?? {}).map(([key, value]: any) => ({
      description: `オプション：${key}`,
      quantity: value.quantity,
      unitPrice: value.unitPrice,
    })),
  ];

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const invoiceNumber = isFinalized ? invoiceData.id : "仮請求書";
  const invoiceDate = isFinalized
    ? new Date(invoiceData.finalizedAt).toISOString().split("T")[0]
    : "未確定";
  const dueDate = "2025-06-10";
  const childName = "山田 太郎"; // TODO: 本来は別APIから取得

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg">
      <div className="text-center border-b pb-4">
        <h1 className="text-3xl font-bold">請求書</h1>
        <p className="mt-2 text-sm">保護者様向け　正式請求書</p>
      </div>

      <div className="mt-4 flex flex-col md:flex-row justify-between">
        <div>
          <p className="font-bold">請求先:</p>
          <p>{childName} 様</p>
          <p>ご住所：〒XXX-XXXX 東京都○○区○○町1-2-3</p>
        </div>
        <div className="text-right">
          <p><strong>請求書番号:</strong> {invoiceNumber}</p>
          <p><strong>発行日:</strong> {invoiceDate}</p>
          <p><strong>支払期日:</strong> {dueDate}</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p><strong>子どものID:</strong> {childId}</p>
        <p><strong>対象月:</strong> {month}</p>
      </div>

      <div className="mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">項目</th>
              <th className="border px-4 py-2 text-right">数量</th>
              <th className="border px-4 py-2 text-right">単価</th>
              <th className="border px-4 py-2 text-right">金額</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">{item.description}</td>
                <td className="border px-4 py-2 text-right">{item.quantity}</td>
                <td className="border px-4 py-2 text-right">¥{item.unitPrice.toLocaleString()}</td>
                <td className="border px-4 py-2 text-right">¥{(item.quantity * item.unitPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="border px-4 py-2 font-bold">小計</td>
              <td className="border px-4 py-2 text-right">¥{subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border px-4 py-2 font-bold">消費税 (10%)</td>
              <td className="border px-4 py-2 text-right">¥{tax.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border px-4 py-2 font-bold">合計</td>
              <td className="border px-4 py-2 text-right font-bold">¥{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
        <p>この請求書はオンラインで発行された正式な書類です。<br />お支払いに関するご質問はお問い合わせください。</p>
      </div>
    </div>
  );
}
