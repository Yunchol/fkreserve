"use client";

import { useEffect, useState } from "react";
import { Reservation, ReservationOption } from "@/types/reservation";

type Props = {
  date: string;
  editingReservation?: Reservation | null;
  onClose: () => void;
  onSubmit: (type: "basic" | "spot", options: ReservationOption) => void;
  onDelete?: (reservationId: string) => void;
};

const CAR_KEYS = ["schoolCar", "homeCar", "lessonCar"] as const;

export default function ReservationModal({
  date,
  editingReservation,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [type, setType] = useState<"basic" | "spot">("spot");
  const [lunch, setLunch] = useState(false);
  const [dinner, setDinner] = useState(false);

  const [carOptions, setCarOptions] = useState<ReservationOption["car"]>({
    schoolCar: { enabled: false, count: 1, time: "" },
    homeCar: { enabled: false, count: 1, time: "" },
    lessonCar: { enabled: false, count: 1, name: "", time: "" },
  });

  useEffect(() => {
    if (editingReservation) {
      const opts = editingReservation.options as any;
      setType(editingReservation.type); // ★ typeをセット
      setLunch(!!opts?.lunch);
      setDinner(!!opts?.dinner);
      if (opts?.car) setCarOptions(opts.car);
    }
  }, [editingReservation]);

  const handleSubmit = () => {
    onSubmit(type, {
      lunch,
      dinner,
      car: carOptions,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md space-y-4 w-[90%] max-w-md">
        <h2 className="text-lg font-semibold">
          {date} の{editingReservation ? "予約編集" : "新規予約"}
        </h2>

        {/* 利用タイプ */}
        <div>
          <label className="block mb-1 font-medium">利用タイプ</label>
          <input
            type="text"
            value={type === "basic" ? "基本利用" : "スポット利用"}
            disabled
            className="w-full border p-2 rounded bg-gray-100 text-gray-600"
          />
        </div>

        {/* 食事オプション */}
        <div>
          <label className="block font-medium mb-1">オプション（食事）</label>
          <label className="block text-sm">
            <input
              type="checkbox"
              checked={lunch}
              onChange={() => setLunch((prev) => !prev)}
              className="mr-2"
            />
            昼食（600円）
          </label>
          <label className="block text-sm">
            <input
              type="checkbox"
              checked={dinner}
              onChange={() => setDinner((prev) => !prev)}
              className="mr-2"
            />
            夕食（600円）
          </label>
        </div>

        {/* 送迎オプション */}
        <div>
          <label className="block font-medium mb-1">送迎オプション</label>
          {CAR_KEYS.map((key) => {
            const labelMap = {
              schoolCar: "学校送迎（500円／回）",
              homeCar: "自宅送迎（500円／回）",
              lessonCar: "習い事送迎（500円／回）",
            };

            return (
              <div key={key} className="border p-2 rounded mb-2">
                <label className="block font-medium mb-1">
                  <input
                    type="checkbox"
                    checked={carOptions[key].enabled}
                    onChange={(e) =>
                      setCarOptions((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], enabled: e.target.checked },
                      }))
                    }
                    className="mr-2"
                  />
                  {labelMap[key]}
                </label>

                {carOptions[key].enabled && (
                  <div className="space-y-2 mt-2 pl-4">
                    <input
                      type="number"
                      min={1}
                      value={carOptions[key].count}
                      onChange={(e) =>
                        setCarOptions((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            count: parseInt(e.target.value, 10) || 1,
                          },
                        }))
                      }
                      className="w-full border p-1 rounded"
                      placeholder="回数"
                    />
                    {key === "lessonCar" && (
                      <input
                        type="text"
                        value={carOptions.lessonCar.name ?? ""}
                        onChange={(e) =>
                          setCarOptions((prev) => ({
                            ...prev,
                            lessonCar: {
                              ...prev.lessonCar,
                              name: e.target.value,
                            },
                          }))
                        }
                        className="w-full border p-1 rounded"
                        placeholder="習い事名"
                      />
                    )}
                    <input
                      type="time"
                      value={carOptions[key].time}
                      onChange={(e) =>
                        setCarOptions((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            time: e.target.value,
                          },
                        }))
                      }
                      className="w-full border p-1 rounded"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ボタン */}
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
              onClick={handleSubmit}
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
