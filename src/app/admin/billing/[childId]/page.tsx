"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// 内訳アイテムの型定義
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function BillingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const childId = params.childId;
  const month = searchParams.get("month") || "未設定";

  const [invoice, setInvoice] = useState<any>(null);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // APIから請求書データ（確定済み or 自動計算結果）を取得する
  useEffect(() => {
    async function fetchData() {
      try {
        if (!childId || month === "未設定") return;
        // まず、請求書が既に確定しているか確認
        const res = await fetch(`/api/admin/invoice?childId=${childId}&month=${month}`);
        const data = await res.json();
        if (data.invoice) {
          setInvoice(data.invoice);
        } else {
          // 確定されていなければ、自動計算結果を取得
          const calcRes = await fetch(`/api/admin/invoice/calculate?childId=${childId}&month=${month}`);
          const calcData = await calcRes.json();
          setCalcResult(calcData);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [childId, month]);

  // 仮の子どもの名前（実際は別APIで取得することも可能）
  const childName = "山田 太郎";

  // invoiceが存在すれば確定済みのデータ、なければ自動計算結果を利用する
  const invoiceData = invoice || calcResult;
  const isFinalized = Boolean(invoice);

  // APIから返ってくる breakdown を使うか、デモ用のダミーデータを利用
  const defaultItems: InvoiceItem[] = [
    { description: "基本利用料金", quantity: 1, unitPrice: 50000 },
    { description: "スポット利用料金", quantity: 1, unitPrice: 12000 },
    { description: "オプション料金", quantity: 2, unitPrice: 2400 },
  ];
  const items: InvoiceItem[] =
    invoiceData && invoiceData.breakdown ? invoiceData.breakdown : defaultItems;

  // 各項目の金額を数量×単価で算出
  const subtotal: number = items.reduce(
    (sum: number, item: InvoiceItem) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxRate = 0.1; // 消費税10%
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  // 請求書番号、発行日は確定済みならAPIの値、なければ仮の表示にする
  const invoiceNumber = isFinalized ? invoice?.id : "仮請求書";
  const invoiceDate = isFinalized
    ? new Date(invoice?.finalizedAt).toISOString().split("T")[0]
    : "未確定";
  const dueDate = "2025-06-10"; // ※必要に応じて計算・設定してください

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg">
      {/* ヘッダー */}
      <div className="text-center border-b pb-4">
        <h1 className="text-3xl font-bold">請求書</h1>
        <p className="mt-2 text-sm">保護者様向け　正式請求書</p>
      </div>

      {/* 請求先・請求情報 */}
      <div className="mt-4 flex flex-col md:flex-row justify-between">
        <div className="mb-4 md:mb-0">
          <p className="font-bold">請求先:</p>
          <p>{childName} 様</p>
          <p>ご住所：〒XXX-XXXX 東京都○○区○○町1-2-3</p>
        </div>
        <div className="text-right">
          <p>
            <strong>請求書番号:</strong> {invoiceNumber}
          </p>
          <p>
            <strong>発行日:</strong> {invoiceDate}
          </p>
          <p>
            <strong>支払期日:</strong> {dueDate}
          </p>
        </div>
      </div>

      {/* 子ども情報 */}
      <div className="mt-4 border-t pt-4">
        <p>
          <strong>子どものID:</strong> {childId}
        </p>
        <p>
          <strong>対象月:</strong> {month}
        </p>
      </div>

      {/* 明細テーブル */}
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
            {items.map((item: InvoiceItem, index: number) => {
              const amount = item.quantity * item.unitPrice;
              return (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.description}</td>
                  <td className="border px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border px-4 py-2 text-right">
                    ¥{item.unitPrice.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2 text-right">
                    ¥{amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="border px-4 py-2 font-bold" colSpan={3}>
                小計
              </td>
              <td className="border px-4 py-2 text-right">
                ¥{subtotal.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-bold" colSpan={3}>
                消費税 (10%)
              </td>
              <td className="border px-4 py-2 text-right">
                ¥{tax.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2 font-bold" colSpan={3}>
                合計
              </td>
              <td className="border px-4 py-2 text-right font-bold">
                ¥{total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* フッター */}
      <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
        <p>
          この請求書はオンラインで発行された正式な書類です。<br />
          お支払いに関するご質問はお問い合わせください。
        </p>
      </div>
    </div>
  );
}
