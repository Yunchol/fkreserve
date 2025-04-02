import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { EventDropArg } from "@fullcalendar/core/index.js";
import { EventClickArg } from "@fullcalendar/core/index.js";
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
  onDateClick?: (dateStr: string) => void;
  onReservationMove?: (reservationId: string, newDateStr: string) => void;
  onEventClick?: (reservationId: string) => void;
};

export default function ReservationCalendar({
  reservations,
  editable = false,
  allowClick = false,
  allowEventClick = false,
  onDateClick,
  onReservationMove,
  onEventClick,
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

  // 🔁 日付比較用のヘルパー関数
  const isSameDay = (a: string | Date, b: string | Date) => {
    return format(new Date(a), "yyyy-MM-dd") === format(new Date(b), "yyyy-MM-dd");
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        events={events}
        editable={editable}
        height="auto"

        // ✅ 日付クリック
        dateClick={(info: DateClickArg) => {
          if (!allowClick || !onDateClick) return;
          const alreadyExists = reservations.some((r) => isSameDay(r.date, info.dateStr));
          if (alreadyExists) {
            alert("この日はすでに予約があります");
            return;
          }
          onDateClick(info.dateStr);
        }}

        // ✅ イベントクリック
        eventClick={(info: EventClickArg) => {
          if (!allowEventClick || !onEventClick) return;
          onEventClick(info.event.id);
        }}

        // ✅ ドラッグ移動
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

        // ✅ eventAllow：事前にブロック
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
