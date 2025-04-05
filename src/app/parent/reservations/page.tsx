"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { useRouter } from "next/navigation"; 

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

export default function ReservationPage() {
  const router = useRouter(); 
  const [children, setChildren] = useState<Child[]>([]);
  const { selectedChildId } = useChildStore();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/parent/reservations");
      const data = await res.json();
      setChildren(data.children);
    };
    fetchReservations();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  useEffect(() => {
    if (!selectedChild) return;
    const mapped = selectedChild.reservations.map((res) => ({
      id: res.id,
      title: `${res.type === "basic" ? "基本" : "スポット"}利用\n${res.options.join("・")}`,
      start: res.date,
      allDay: true,
    }));
    setEvents(mapped);
  }, [selectedChild]);

  return (
    <div className="p-4">
      {/* ▼ 上部バー：セレクター + ボタン */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <ChildSelector children={children} />

        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            onClick={() => router.push("/parent/reservations/new")}
          >
            新規予約を作成
          </button>
          <button
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 border border-blue-300 text-sm"
            onClick={() => router.push("/parent/reservations/edit")}
          >
            予約を編集
          </button>
        </div>
      </div>

      <h1 className="text-lg font-semibold mb-4">予約状況カレンダー</h1>

      {selectedChild ? (
        <div className="bg-white shadow rounded p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="ja"
            events={events}
            editable={false}
            selectable={false}
            height="auto"
          />
        </div>
      ) : (
        <p>子どもを選択してください</p>
      )}
    </div>
  );
} 
