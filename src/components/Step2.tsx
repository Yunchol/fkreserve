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

    // 選択済み日数が超えてたらカット
    if (spotSelectedDates.length > value) {
      setSpotSelectedDates(spotSelectedDates.slice(0, value));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">スポット利用回数を選択</label>
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
