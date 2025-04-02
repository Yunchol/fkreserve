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

        // ✅ 日付クリック時：すでに予約があればモーダルを開かない
        dateClick={(info: DateClickArg) => {
          const alreadyExists = reservations.some((r) => r.date === info.dateStr);
          if (alreadyExists) {
            alert("この日はすでに予約があります");
            return;
          }
          if (onDateClick) onDateClick(info.dateStr);
        }}

        // ✅ イベントクリック：編集モーダルを開く
        eventClick={(info: EventClickArg) => {
          if (onEventClick) {
            onEventClick(info.event.id);
          }
        }}

        // ✅ ドラッグ移動時：移動先に予約がある場合はキャンセル
        eventDrop={(info: EventDropArg) => {
          const targetDate = info.event.startStr;
          const reservationId = info.event.id;

          const isDuplicate = reservations.some(
            (r) => r.date === targetDate && r.id !== reservationId
          );

          if (isDuplicate) {
            alert("その日にはすでに予約があります！");
            info.revert(); // 元に戻す
            return;
          }

          if (onReservationMove) {
            onReservationMove(reservationId, targetDate);
          }
        }}

        // ✅ 保険的に eventAllow でもブロック（移動先に他の予約がある場合）
        eventAllow={(dropInfo, draggedEvent) => {
          if (!draggedEvent) return false; // nullだったら許可しない
        
          const targetDate = dropInfo.startStr;
          const reservationId = draggedEvent.id;
        
          const isDuplicate = reservations.some(
            (r) => r.date === targetDate && r.id !== reservationId
          );
        
          return !isDuplicate;
        }}
        
      />
    </div>
  );
}
