import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { EventDropArg } from "@fullcalendar/core/index.js";
import { EventClickArg } from "@fullcalendar/core/index.js";

type Reservation = {
  id: string;
  date: string;
  type: string;
  options: string[];
};

type Props = {
  reservations: Reservation[];
  onDateClick?: (dateStr: string) => void;
  onReservationMove?: (reservationId: string, newDateStr: string) => void;
  onEventClick?: (reservationId: string) => void;
};

export default function ReservationCalendar({
  reservations,
  onDateClick,
  onReservationMove,
  onEventClick
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

  return (
    <div className="p-4 bg-white shadow rounded">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        events={events}
        editable={true} // ドラッグ可能にする
        height="auto"
        dateClick={(info: DateClickArg) => {
          if (onDateClick) onDateClick(info.dateStr);
        }}
        eventDrop={(info: EventDropArg) => {
          // ドラッグ後に日付が変更されたときの処理
          if (onReservationMove) {
            onReservationMove(info.event.id, info.event.startStr);
          }
        }}
        eventClick={(info: EventClickArg) => {
          if (onEventClick) {
            onEventClick(info.event.id);
          }
        }}
      />
    </div>
  );
}
