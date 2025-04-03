import { useState } from "react";
import { Reservation } from "@/types/reservation";
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

  const handleSubmit = (type: "basic" | "spot", options: string[]) => {
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
