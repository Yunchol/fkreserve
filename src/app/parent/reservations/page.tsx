"use client";

import { useEffect, useState } from "react";
import ReservationCalendar from "@/components/ReservationCalendar";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { postReservation } from "@/lib/api/reservation";
import ReservationModal from "@/components/ReservationModal";

type Reservation = {
  id: string;
  date: string;
  type: string;
  options: string[];
};

type Child = {
  id: string;
  name: string;
  reservations: Reservation[];
};

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { selectedChildId } = useChildStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/parent/reservations");
      const data = await res.json();
      setChildren(data.children);
    };
    fetchReservations();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const handleDateClick = (date: string) => {
    console.log("クリックした日付:", date); 
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleReservationSubmit = async (
    type: "basic" | "spot",
    options: string[]
  ) => {
    if (!selectedChildId || !selectedDate) return;
    try {
      // 新しい予約をAPIに送信
      await postReservation({
        childId: selectedChildId,
        date: selectedDate,
        type,
        options,
      });
  
      // 成功後、該当の子どもの予約を更新
      setChildren((prev) =>
        prev.map((child) =>
          child.id === selectedChildId
            ? {
                ...child,
                reservations: [
                  ...child.reservations,
                  {
                    id: `${selectedChildId}-${selectedDate}`, // 仮ID（サーバーIDが必要なら再取得もあり）
                    date: selectedDate,
                    type,
                    options,
                  },
                ],
              }
            : child
        )
      );
  
      alert("予約完了！");
      setShowModal(false);
    } catch (err) {
      alert("送信エラー");
    }
  };
  

    return (
      <div className="p-4">
        <ChildSelector children={children} />
        <h1 className="text-xl font-semibold mb-4">予約カレンダー</h1>
        {selectedChild ? (
          <ReservationCalendar
            reservations={selectedChild.reservations}
            onDateClick={handleDateClick}
          />
        ) : (
          <p>子どもを選択してください</p>
        )}
        {showModal && selectedDate && (
          <ReservationModal
            date={selectedDate}
            onClose={() => setShowModal(false)}
            onSubmit={handleReservationSubmit}
          />
        )}
      </div>
    );
}
