// src/components/ReservationModal.tsx
"use client";

type Props = {
  date: string;
  onClose: () => void;
  onSubmit: (type: "basic" | "spot", options: string[]) => void;
};

import { useState } from "react";

export default function ReservationModal({ date, onClose, onSubmit }: Props) {
  const [type, setType] = useState<"basic" | "spot">("basic");
  const [optionsText, setOptionsText] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md space-y-4 w-[90%] max-w-md">
        <h2 className="text-lg font-semibold">{date} の予約</h2>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "basic" | "spot")}
          className="w-full border p-2 rounded"
        >
          <option value="basic">基本利用</option>
          <option value="spot">スポット利用</option>
        </select>

        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="オプション（カンマ区切り）"
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>キャンセル</button>
          <button
            onClick={() => {
              const options = optionsText.split(",").map((s) => s.trim());
              onSubmit(type, options);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            予約する
          </button>
        </div>
      </div>
    </div>
  );
}
