"use client";

import { useEffect, useState } from "react";
import ReservationCalendar from "@/components/ReservationCalendar";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";

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

  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/parent/reservations");
      const data = await res.json();
      setChildren(data.children);
    };
    fetchReservations();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="p-4">

        <ChildSelector children={children} />

      <h1 className="text-xl font-semibold mb-4">予約カレンダー</h1>
      {/* 子どもが1人以上いる時だけ表示 */}
      {selectedChild ? (
        <ReservationCalendar reservations={selectedChild.reservations} />
      ) : (
        <p>子どもを選択してください</p>
      )}
    </div>
  );
}
