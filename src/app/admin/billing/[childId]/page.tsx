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
          setNote(""); // 新規なので空にしておく
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

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!invoiceData?.breakdown) return <p>データが見つかりませんでした。</p>;

  const { breakdown } = invoiceData;
  const weeklyCount = invoiceData.weeklyCount ?? 0;
  const basicUnitPrice = breakdown.basic?.unitPrice ?? 0;

  const items: InvoiceItem[] = [
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

  const subtotal = basicUnitPrice + items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const invoiceNumber = isFinalized ? invoiceData.id : "仮請求書";
  const invoiceDate = isFinalized && invoiceData.finalizedAt
  ? new Date(invoiceData.finalizedAt).toISOString().split("T")[0]
  : "未確定";

  const dueDate = "2025-06-10";

  return (
  <div>
    {/* 🔽 印刷対象エリア */}
    <div id="invoice-print-area" className="p-6 max-w-3xl mx-auto bg-white shadow-lg">
      {/* ヘッダー */}
      <div className="text-center border-b pb-4">
        <h1 className="text-3xl font-bold">請求書</h1>
        <p className="mt-2 text-sm">保護者様向け　正式請求書</p>
      </div>

      {/* 請求先 */}
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

      {/* 基本情報 */}
      <div className="mt-4 border-t pt-4">
        <p><strong>子どものID:</strong> {childId}</p>
        <p><strong>対象月:</strong> {month}</p>
      </div>

      {/* 明細 */}
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
            <tr>
              <td className="border px-4 py-2">基本利用料金</td>
              <td className="border px-4 py-2 text-right">{weeklyCount}</td>
              <td className="border px-4 py-2 text-right">¥{basicUnitPrice.toLocaleString()}</td>
              <td className="border px-4 py-2 text-right">¥{basicUnitPrice.toLocaleString()}</td>
            </tr>

            {items.map((item, idx) => {
              const amount = item.quantity * item.unitPrice;
              return (
                <tr key={idx}>
                  <td className="border px-4 py-2">{item.description}</td>
                  <td className="border px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border px-4 py-2 text-right">¥{item.unitPrice.toLocaleString()}</td>
                  <td className="border px-4 py-2 text-right">¥{amount.toLocaleString()}</td>
                </tr>
              );
            })}
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

      {/* 備考欄 */}
      <div className="mt-6">
        <label className="block font-semibold mb-1">備考</label>
        {isFinalized ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{note || "―"}</p>
        ) : (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            rows={4}
            placeholder="特記事項などがあれば入力してください"
          />
        )}
      </div>

      {/* フッター */}
      <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
        <p>この請求書はオンラインで発行された正式な書類です。<br />お支払いに関するご質問はお問い合わせください。</p>
      </div>
    </div>

    {/* 🔽 印刷ボタンと請求確定ボタン（印刷時は非表示） */}
    <div className="mt-4 text-right no-print space-x-2">
      {!isFinalized && (
        <button
          onClick={handleFinalize}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          請求を確定する
        </button>
      )}
      {isFinalized && (
        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          印刷／PDF保存
        </button>
      )}
    </div>
  </div>
);

}
