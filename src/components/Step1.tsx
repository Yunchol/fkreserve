"use client";

import React from "react";

type Props = {
  weeklyUsage: number;
  setWeeklyUsage: (count: number) => void;
  selectedDays: { [key: string]: boolean };
  setSelectedDays: (days: { [key: string]: boolean }) => void;
};

const DAYS = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日"];

export default function Step1({
  weeklyUsage,
  setWeeklyUsage,
  selectedDays,
  setSelectedDays,
}: Props) {
  const handleDayToggle = (day: string) => {
    const currentCount = Object.values(selectedDays).filter(Boolean).length;

    if (!selectedDays[day] && currentCount >= weeklyUsage) {
      alert(`週${weeklyUsage}回なので${weeklyUsage}つまで選択できます`);
      return;
    }

    setSelectedDays({
      ...selectedDays,
      [day]: !selectedDays[day],
    });
  };

  return (
    <div className="space-y-4">
      {/* 利用回数の選択 */}
      <div>
        <label className="block font-medium mb-1">週の利用回数</label>
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
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              週{num}回
            </option>
          ))}
        </select>
      </div>

      {/* 曜日の選択 */}
      <div>
        <label className="block font-medium mb-1">
          利用曜日（{Object.values(selectedDays).filter((v) => v).length}/{weeklyUsage}）
        </label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => handleDayToggle(day)}
              className={`px-4 py-2 rounded border ${
                selectedDays[day] ? "bg-blue-600 text-white" : "bg-white"
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
