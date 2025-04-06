"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
// import { EventDropArg, EventClickArg } from "@fullcalendar/core";
import { format } from "date-fns";
import { Reservation, ReservationOption } from "@/types/reservation";

type Props = {
  reservations: Reservation[];
  editable?: boolean;
  allowClick?: boolean;
  allowEventClick?: boolean;
  onDateClick?: (info: DateClickArg) => void;
  onReservationMove?: (reservationId: string, newDateStr: string) => void;
  onEventClick?: (reservationId: string) => void;
  mode?: "new" | "edit";
};

export default function ReservationCalendar({
  reservations,
  editable = false,
  allowClick = false,
  allowEventClick = false,
  onDateClick,
  onReservationMove,
  onEventClick,
  mode = "new",
}: Props) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const mapped = reservations.map((res) => {
      const opts = res.options as ReservationOption;

      const parts: string[] = [];

      if (opts?.lunch) parts.push("昼食");
      if (opts?.dinner) parts.push("夕食");

      if (opts?.car?.schoolCar?.enabled)
        parts.push(`学校送迎(${opts.car.schoolCar.count}回)`);
      if (opts?.car?.homeCar?.enabled)
        parts.push(`自宅送迎(${opts.car.homeCar.count}回)`);
      if (opts?.car?.lessonCar?.enabled) {
        const name = opts.car.lessonCar.name || "習い事";
        parts.push(`${name}送迎(${opts.car.lessonCar.count}回)`);
      }

      return {
        id: res.id,
        title: `${res.type === "basic" ? "基本" : "スポット"}利用<br />${parts.join("<br />")}`,
        start: res.date,
        allDay: true,
      };
      
    });

    setEvents(mapped);
  }, [reservations]);

  const isSameDay = (a: string | Date, b: string | Date) =>
    format(new Date(a), "yyyy-MM-dd") === format(new Date(b), "yyyy-MM-dd");

  const today = new Date();
  const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const lastDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const calendarStart = format(firstDayNextMonth, "yyyy-MM-dd");
  const calendarEnd = mode === "new" ? format(lastDayNextMonth, "yyyy-MM-dd") : undefined;

  return (
    <div className="p-4 bg-white shadow rounded">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={calendarStart}
        locale="ja"
        events={events}
        editable={editable}
        height="auto"
        validRange={{ start: calendarStart, end: calendarEnd }}
        dateClick={(info) => {
          if (!allowClick || !onDateClick) return;
          const alreadyExists = reservations.some((r) => isSameDay(r.date, info.dateStr));
          if (alreadyExists) {
            alert("この日はすでに予約があります");
            return;
          }
          onDateClick(info);
        }}
        eventClick={(info) => {
          if (!allowEventClick || !onEventClick) return;
          onEventClick(info.event.id);
        }}
        eventDrop={(info) => {
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

          return !reservations.some(
            (r) => isSameDay(r.date, targetDate) && r.id !== reservationId
          );
        }}
        eventContent={(arg) => {
          return {
            html: `<div style="white-space: normal; font-size: 0.85rem;">${arg.event.title}</div>`,
          };
        }}
        
      />
    </div>
  );
}
