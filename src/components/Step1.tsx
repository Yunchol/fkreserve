"use client";

import React from "react";

type Props = {
  weeklyUsage: number;
  setWeeklyUsage: (count: number) => void;
  selectedDays: string[];
  setSelectedDays: (days: string[]) => void;
};

const DAYS = ["月", "火", "水", "木", "金"];

export default function Step1({
  weeklyUsage,
  setWeeklyUsage,
  selectedDays,
  setSelectedDays,
}: Props) {
  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      if (selectedDays.length < weeklyUsage) {
        setSelectedDays([...selectedDays, day]);
      } else {
        alert(`週${weeklyUsage}回なので${weeklyUsage}つまで選択できます`);
      }
    }
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
            setSelectedDays([]); // 選び直しのためにリセット
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
        <label className="block font-medium mb-1">利用曜日（{selectedDays.length}/{weeklyUsage}）</label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day) => {
            const selected = selectedDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => handleDayToggle(day)}
                className={`px-4 py-2 rounded border ${
                  selected ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
