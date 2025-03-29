"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // 追加
import { useEffect, useState } from "react";
import { CalendarOptions } from "@fullcalendar/core"; 
import { DateClickArg } from "@fullcalendar/interaction";

type Reservation = {
  id: string;
  date: string;
  type: string;
  options: string[];
};

type Props = {
  reservations: Reservation[];
  onDateClick?: (dateStr: string) => void;
};

export default function ReservationCalendar({ reservations, onDateClick }: Props) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const mapped = reservations.map((res) => ({
      id: res.id,
      title: `${res.type === "basic" ? "基本" : "スポット"}利用\n${res.options.join("・")}`,
      start: res.date,
      allDay: true,
    }));
    setEvents(mapped);
  }, [reservations]);

  return (
    <div className="p-4 bg-white shadow rounded">
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]} // interactionPluginを追加
        initialView="dayGridMonth"
        locale="ja"
        events={events}
        height="auto"
        dateClick={(info: DateClickArg) => {
          if (onDateClick) onDateClick(info.dateStr);
        }}
      />

    </div>
  );
}
