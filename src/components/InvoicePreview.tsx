"use client";

import { useState } from "react";

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type Breakdown = {
  basic?: { unitPrice: number };
  spot?: { quantity: number; unitPrice: number };
  options?: {
    [key: string]: { quantity: number; unitPrice: number };
  };
};

type Props = {
  invoiceId?: string;
  childId: string;
  childName?: string;
  month: string;
  breakdown: Breakdown;
  weeklyCount: number;
  note?: string;
  onNoteChange?: (note: string) => void; // ✅ カスタムプロップ
  finalizedAt?: string;
  readonly?: boolean;
  showPrintButton?: boolean;
};

export default function InvoicePreview({
  invoiceId,
  childId,
  childName = "―",
  month,
  breakdown,
  weeklyCount,
  note = "",
  onNoteChange, // ✅ ← ここが足りてなかった！
  finalizedAt,
  readonly = true,
  showPrintButton = true,
}: Props) {
  const [editableNote, setEditableNote] = useState(note);

  const basicUnitPrice = breakdown.basic?.unitPrice ?? 0;

  const fixedOptions = ["昼食", "夕食", "習い事送迎", "自宅送迎", "学校送迎"];

  const optionLabelToKey: Record<string, string> = {
    "昼食": "lunch",
    "夕食": "dinner",
    "習い事送迎": "lesson_car",
    "自宅送迎": "home_car",
    "学校送迎": "school_car",
  };

  const items: InvoiceItem[] = [
    {
      description: "スポット利用料金",
      quantity: breakdown.spot?.quantity ?? 0,
      unitPrice: breakdown.spot?.unitPrice ?? 0,
    },
    ...fixedOptions.map((label) => {
      const key = optionLabelToKey[label];
      const option = breakdown.options?.[key];
      return {
        description: `オプション：${label}`,
        quantity: option?.quantity ?? 0,
        unitPrice: option?.unitPrice ?? 0,
      };
    }),
  ];

  const subtotal =
    basicUnitPrice + items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const invoiceNumber = finalizedAt ? invoiceId : "仮請求書";
  const invoiceDate = finalizedAt
    ? new Date(finalizedAt).toISOString().split("T")[0]
    : "未確定";
  const dueDate = "2025-06-10";

  console.log("💡 breakdown.options:", breakdown.options);


  return (
    <div>
      <div
        id="invoice-print-area"
        className="p-6 max-w-[800px] mx-auto bg-white shadow print:shadow-none print:p-4 print:h-[100vh] text-sm"
      >
        {/* ヘッダー */}
        <div className="text-center border-b pb-3">
          <h1 className="text-2xl font-bold">請求書</h1>
          <p className="mt-1 text-xs text-gray-600">保護者様向け 正式請求書</p>
        </div>

        {/* 請求先情報 */}
        <div className="mt-4 flex flex-col md:flex-row justify-between">
          <div>
            <p className="font-bold">請求先:</p>
            <p>{childName} 様</p>
            <p>ご住所：〒XXX-XXXX 東京都○○区○○町1-2-3</p>
          </div>
          <div className="text-right text-sm">
            <p><strong>請求書番号:</strong> {invoiceNumber}</p>
            <p><strong>発行日:</strong> {invoiceDate}</p>
            <p><strong>支払期日:</strong> {dueDate}</p>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="mt-3 border-t pt-3">
          <p><strong>子どものID:</strong> {childId}</p>
          <p><strong>対象月:</strong> {month}</p>
        </div>

        {/* 明細表 */}
        <div className="mt-4">
          <table className="w-full border border-gray-300 text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-4 text-left">項目</th>
                <th className="border px-3 py-4 text-right">数量</th>
                <th className="border px-3 py-4 text-right">単価</th>
                <th className="border px-3 py-4 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-4">基本利用料金</td>
                <td className="border px-3 py-4 text-right">{weeklyCount}</td>
                <td className="border px-3 py-4 text-right">¥{basicUnitPrice.toLocaleString()}</td>
                <td className="border px-3 py-4 text-right">¥{basicUnitPrice.toLocaleString()}</td>
              </tr>
              {items.map((item, idx) => {
                const amount = item.quantity * item.unitPrice;
                return (
                  <tr key={idx}>
                    <td className="border px-3 py-4">{item.description}</td>
                    <td className="border px-3 py-4 text-right">{item.quantity}</td>
                    <td className="border px-3 py-4 text-right">¥{item.unitPrice.toLocaleString()}</td>
                    <td className="border px-3 py-4 text-right">¥{amount.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="border px-3 py-4 font-bold">小計</td>
                <td className="border px-3 py-4 text-right">¥{subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={3} className="border px-3 py-4 font-bold">消費税 (10%)</td>
                <td className="border px-3 py-4 text-right">¥{tax.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={3} className="border px-3 py-4 font-bold">合計</td>
                <td className="border px-3 py-4 text-right font-bold">¥{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 備考欄 */}
        <div className="mt-4">
          <label className="block font-semibold text-sm mb-1">備考</label>
          {readonly ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[3.5rem] leading-snug">
              {note || "―"}
            </p>
          ) : (
            <textarea
              value={editableNote}
              onChange={(e) => {
                const newValue = e.target.value;
                const lineCount = newValue.split("\n").length;
                if (lineCount <= 3 && newValue.length <= 200) {
                  setEditableNote(newValue);
                  onNoteChange?.(newValue); // ✅ 親に通知！
                }
              }}
              className="w-full border rounded p-2 text-sm"
              rows={3}
              maxLength={200}
              placeholder="特記事項などがあれば入力してください（最大3行／200文字）"
            />
          )}
        </div>

        {/* フッター */}
        <div className="mt-6 border-t pt-3 text-center text-xs text-gray-500 leading-snug">
          <p>この請求書はオンラインで発行された正式な書類です。</p>
          <p>お支払いに関するご質問はお問い合わせください。</p>
        </div>
      </div>

      {/* 印刷ボタン */}
      {showPrintButton && (
        <div className="mt-4 text-right no-print">
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            印刷／PDF保存
          </button>
        </div>
      )}
    </div>
  );
}
