"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { EventDropArg, EventClickArg } from "@fullcalendar/core";
import { format } from "date-fns";

type Reservation = {
  id: string;
  date: string;
  type: string;
  options: string[];
};

type Props = {
  reservations: Reservation[];
  editable?: boolean;
  allowClick?: boolean;
  allowEventClick?: boolean;
  onDateClick?: (info: DateClickArg) => void;
  onReservationMove?: (reservationId: string, newDateStr: string) => void;
  onEventClick?: (reservationId: string) => void;
  startDate?: string; // 🔸 表示開始日
  endDate?: string;   // 🔸 表示終了日
};

export default function ReservationCalendar({
  reservations,
  editable = false,
  allowClick = false,
  allowEventClick = false,
  onDateClick,
  onReservationMove,
  onEventClick,
  startDate,
  endDate,
}: Props) {
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

  const isSameDay = (a: string | Date, b: string | Date) => {
    return format(new Date(a), "yyyy-MM-dd") === format(new Date(b), "yyyy-MM-dd");
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={startDate ?? format(new Date(), "yyyy-MM-dd")} // 初期表示日
        locale="ja"
        events={events}
        editable={editable}
        height="auto"
        validRange={{
          start: startDate,
          end: endDate,
        }}
        dateClick={(info: DateClickArg) => {
          if (!allowClick || !onDateClick) return;
          const alreadyExists = reservations.some((r) => isSameDay(r.date, info.dateStr));
          if (alreadyExists) {
            alert("この日はすでに予約があります");
            return;
          }
          onDateClick(info);
        }}
        eventClick={(info: EventClickArg) => {
          if (!allowEventClick || !onEventClick) return;
          onEventClick(info.event.id);
        }}
        eventDrop={(info: EventDropArg) => {
          if (!editable || !onReservationMove) {
            info.revert();
            return;
          }

          const targetDate = info.event.start!;
          const reservationId = info.event.id;

          const isDuplicate = reservations.some(
            (r) => isSameDay(r.date, targetDate) && r.id !== reservationId
          );

          if (isDuplicate) {
            alert("その日にはすでに予約があります！");
            info.revert();
            return;
          }

          onReservationMove(reservationId, format(targetDate, "yyyy-MM-dd"));
        }}
        eventAllow={(dropInfo, draggedEvent) => {
          if (!editable || !draggedEvent) return false;
          const targetDate = dropInfo.start;
          const reservationId = draggedEvent.id;

          const isDuplicate = reservations.some(
            (r) => isSameDay(r.date, targetDate) && r.id !== reservationId
          );

          return !isDuplicate;
        }}
      />
    </div>
  );
}
