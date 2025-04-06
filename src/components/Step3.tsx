"use client";

import { useState } from "react";
import { Reservation, ReservationOption } from "@/types/reservation";
import ReservationModal from "@/components/ReservationModal";

type Step3Props = {
  calendarEvents: Reservation[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<Reservation[]>>;
};

export default function Step3({ calendarEvents, setCalendarEvents }: Step3Props) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const handleOpenModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const handleCloseModal = () => {
    setSelectedReservation(null);
  };

  const handleSubmit = (type: "basic" | "spot", options: ReservationOption) => {
    if (!selectedReservation) return;

    setCalendarEvents((prev) =>
      prev.map((res) =>
        res.id === selectedReservation.id
          ? { ...res, options }
          : res
      )
    );
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">日ごとのオプションを設定</h2>

      {calendarEvents.length === 0 && <p className="text-sm text-gray-500">予約がまだありません。</p>}

      <ul className="space-y-2">
        {calendarEvents.map((res) => (
          <li key={res.id} className="border p-3 rounded shadow-sm flex justify-between items-center">
            <div>
              <p className="font-medium">{res.date}（{res.type === "basic" ? "基本" : "スポット"}）</p>
              {/* オプションの簡易表示（必要に応じて展開） */}
              <p className="text-sm text-gray-500">
                {res.options.lunch && "昼食・"}
                {res.options.dinner && "夕食・"}
                {res.options.car.schoolCar.enabled && "学校送迎・"}
                {res.options.car.homeCar.enabled && "自宅送迎・"}
                {res.options.car.lessonCar.enabled && `${res.options.car.lessonCar.name}送迎`}
              </p>
            </div>
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => handleOpenModal(res)}
            >
              オプション編集
            </button>
          </li>
        ))}
      </ul>

      {/* モーダル表示 */}
      {selectedReservation && (
        <ReservationModal
          date={selectedReservation.date}
          editingReservation={selectedReservation}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
