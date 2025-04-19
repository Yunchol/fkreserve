"use client";

import React from "react";
import { ArrowDown } from "lucide-react"; // ← アイコン使う場合

type Props = {
  weeklyUsage: number;
  setWeeklyUsage: (count: number) => void;
  selectedDays: { [key: string]: boolean };
  setSelectedDays: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
};

const DAYS = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日"];

export default function Step1({
  weeklyUsage,
  setWeeklyUsage,
  selectedDays,
  setSelectedDays,
}: Props) {
  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => {
      const currentCount = Object.values(prev).filter(Boolean).length;
      const isSelected = prev[day] ?? false;

      if (isSelected) {
        return { ...prev, [day]: false };
      }

      if (currentCount >= weeklyUsage) {
        alert(`週${weeklyUsage}回なので${weeklyUsage}つまで選択できます`);
        return prev;
      }

      return { ...prev, [day]: true };
    });
  };

  const selectedCount = Object.values(selectedDays).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* 週の利用回数の選択 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="font-medium">週の利用回数</label>
          {weeklyUsage === 0 && (
            <span className="text-blue-500 animate-bounce">⬇︎ こちらを選択！</span>
          )}
        </div>
        <select
          value={weeklyUsage}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setWeeklyUsage(value);

            // 曜日リセット
            const resetDays: { [key: string]: boolean } = {};
            DAYS.forEach((day) => (resetDays[day] = false));
            setSelectedDays(resetDays);
          }}
          className="border p-2 rounded w-full max-w-xs"
        >
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              週{num}回
            </option>
          ))}
        </select>
      </div>

      {/* 曜日の選択 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="font-medium">
            利用曜日（{selectedCount}/{weeklyUsage}）
          </label>
          {weeklyUsage > 0 && selectedCount === 0 && (
            <span className="text-blue-500 animate-bounce">⬇︎ 曜日を選ぶ！</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => handleDayToggle(day)}
              className={`px-4 py-2 rounded border transition ${
                selectedDays[day]
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
