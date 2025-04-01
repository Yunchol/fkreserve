"use client";

import { useState } from "react";
import { Reservation } from "@/types/reservation";

type Props = {
  date: string;
  editingReservation?: Reservation | null;
  onClose: () => void;
  onSubmit: (type: "basic" | "spot", options: string[]) => void;
  onDelete?: (reservationId: string) => void;
};

const AVAILABLE_OPTIONS = ["おやつ", "昼食", "夕食", "送迎"];

export default function ReservationModal({ date, onClose, onSubmit }: Props) {
  const [type, setType] = useState<"basic" | "spot">("basic");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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
        <h2 className="text-lg font-semibold">{date} の予約</h2>

        {/* 利用タイプの選択 */}
        <div>
          <label className="block mb-1 font-medium">利用タイプ</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "basic" | "spot")}
            className="w-full border p-2 rounded"
          >
            <option value="basic">基本利用</option>
            <option value="spot">スポット利用</option>
          </select>
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

        {/* ボタン */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="text-gray-600 hover:underline">
            キャンセル
          </button>
          <button
            onClick={() => onSubmit(type, selectedOptions)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            予約する
          </button>
        </div>
      </div>
    </div>
  );
}
