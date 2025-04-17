"use client";

import React from "react";

type Props = {
  spotDays: number;
  setSpotDays: (val: number) => void;
  spotSelectedDates: string[];
  setSpotSelectedDates: (dates: string[]) => void;
};

const Step2 = ({
  spotDays,
  setSpotDays,
  spotSelectedDates,
  setSpotSelectedDates,
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setSpotDays(value);

    if (spotSelectedDates.length > value) {
      setSpotSelectedDates(spotSelectedDates.slice(0, value));
    }
  };

  return (
    <div className="space-y-6">
      {/* スポット利用回数の選択 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="font-medium">スポット利用回数を選択</label>
          {spotDays === 0 && (
            <span className="text-blue-500 animate-bounce">⬅ こちらから選択！</span>
          )}
        </div>
        <select
          value={spotDays}
          onChange={handleChange}
          className="border rounded p-2 w-full max-w-xs"
        >
          <option value={0}>選択してください</option>
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} 回
            </option>
          ))}
        </select>
      </div>

      {/* スポット日選択の誘導 */}
      {spotDays > 0 && spotSelectedDates.length === 0 && (
        <p className="text-blue-500 animate-bounce text-sm">
          カレンダーの日付を {spotDays} 日分クリックしてください！➡︎
        </p>
      )}

      {/* 選択された日リスト */}
      {spotSelectedDates.length > 0 && (
        <div>
          <p className="font-medium mb-1">選択中のスポット日：</p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {spotSelectedDates.map((date) => (
              <li key={date}>{date}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Step2;
