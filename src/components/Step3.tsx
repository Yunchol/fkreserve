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

  const isEmptyOptions = (options: ReservationOption) =>
    !options.lunch &&
    !options.dinner &&
    !options.car.schoolCar.enabled &&
    !options.car.homeCar.enabled &&
    !options.car.lessonCar.enabled;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">日ごとのオプションを設定</h2>

      {/* 案内メッセージ */}
      {calendarEvents.length > 0 && (
        <p className="text-sm text-blue-600 animate-pulse">
            選択したイベント（
            <span className="text-blue-600 font-semibold">青</span> /
            <span className="text-green-600 font-semibold">緑</span>
            ）を押して、
          オプションを設定してください ➡︎
        </p>
      )}


      {calendarEvents.length === 0 && (
        <p className="text-sm text-gray-500">予約がまだありません。</p>
      )}


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
