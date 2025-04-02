"use client";

import { useEffect, useState } from "react";
import { Reservation } from "@/types/reservation";

type Props = {
  date: string;
  editingReservation?: Reservation | null;
  onClose: () => void;
  onSubmit: (type: "basic" | "spot", options: string[]) => void;
  onDelete?: (reservationId: string) => void;
};

const AVAILABLE_OPTIONS = ["おやつ", "昼食", "夕食", "送迎"];

export default function ReservationModal({
  date,
  editingReservation,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [type] = useState<"spot">("spot"); // ← type を spot で固定
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    if (editingReservation) {
      setSelectedOptions(editingReservation.options);
    }
  }, [editingReservation]);

  const toggleOption = (opt: string) => {
    setSelectedOptions((prev) =>
      prev.includes(opt)
        ? prev.filter((o) => o !== opt)
        : [...prev, opt]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md space-y-4 w-[90%] max-w-md">
        <h2 className="text-lg font-semibold">
          {date} の{editingReservation ? "予約編集" : "新規予約"}
        </h2>

        {/* 利用タイプ（固定で表示だけ） */}
        <div>
          <label className="block mb-1 font-medium">利用タイプ</label>
          <input
            type="text"
            value="スポット利用"
            disabled
            className="w-full border p-2 rounded bg-gray-100 text-gray-600"
          />
        </div>

        {/* オプション選択 */}
        <div>
          <label className="block mb-1 font-medium">オプション</label>
          <div className="space-y-1">
            {AVAILABLE_OPTIONS.map((opt) => (
              <label key={opt} className="block text-sm">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* ボタン群 */}
        <div className="flex justify-between items-center pt-4">
          {editingReservation && onDelete && (
            <button
              onClick={() => onDelete(editingReservation.id)}
              className="text-red-600 hover:underline text-sm"
            >
              この予約を削除
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="text-gray-600 hover:underline">
              キャンセル
            </button>
            <button
              onClick={() => onSubmit(type, selectedOptions)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingReservation ? "更新する" : "予約する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
