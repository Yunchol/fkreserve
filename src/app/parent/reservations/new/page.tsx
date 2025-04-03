"use client";

import { useEffect, useState } from "react";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import ReservationCalendar from "@/components/ReservationCalendar";
import Step1 from "@/components/Step1";
import Step2 from "@/components/Step2";
import { format } from "date-fns";
import { DateClickArg } from "@fullcalendar/interaction";

type Reservation = {
  id: string;
  date: string;
  type: "basic" | "spot";
  options: string[];
};

type Child = {
  id: string;
  name: string;
  reservations: Reservation[];
};

export default function NewReservationPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState<Reservation[]>([]);
  const [weeklyUsage, setWeeklyUsage] = useState(0);
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({
    月曜日: false,
    火曜日: false,
    水曜日: false,
    木曜日: false,
    金曜日: false,
  });
  const [spotDays, setSpotDays] = useState(0);
  const [spotSelectedDates, setSpotSelectedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [children, setChildren] = useState<Child[]>([]);
  const { selectedChildId } = useChildStore();

  const selectedChild = children.find((c) => c.id === selectedChildId);

  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/parent/reservations");
      const data = await res.json();
      setChildren(data.children);
    };
    fetchReservations();
  }, []);

  const handleDateClick = (info: DateClickArg) => {
    const clickedDate = info.dateStr;

    const exists = calendarEvents.some((r) => r.date === clickedDate);
    if (exists) {
      alert("すでにその日の予約があります");
      return;
    }

    if (spotSelectedDates.includes(clickedDate)) {
      setSpotSelectedDates((prev) => prev.filter((d) => d !== clickedDate));
      setCalendarEvents((prev) =>
        prev.filter((e) => !(e.date === clickedDate && e.type === "spot"))
      );
    } else if (spotSelectedDates.length < spotDays) {
      setSpotSelectedDates([...spotSelectedDates, clickedDate]);
      setCalendarEvents((prev) => [
        ...prev,
        {
          id: `spot-${clickedDate}`,
          date: clickedDate,
          type: "spot",
          options: [],
        },
      ]);
    }
  };

  useEffect(() => {
    const generateBaseEvents = () => {
      const startOfNextMonth = new Date();
      startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      startOfNextMonth.setDate(1);

      const endOfNextMonth = new Date(startOfNextMonth.getFullYear(), startOfNextMonth.getMonth() + 1, 0);

      const newEvents: Reservation[] = [];

      for (let d = new Date(startOfNextMonth); d <= endOfNextMonth; d.setDate(d.getDate() + 1)) {
        const dayName = d.toLocaleDateString("ja-JP", { weekday: "long" });
        const formatted = format(d, "yyyy-MM-dd");

        if (selectedDays[dayName]) {
          const alreadyExists = calendarEvents.some(
            (e) => e.date === formatted && e.type === "basic"
          );
          if (!alreadyExists) {
            newEvents.push({
              id: `basic-${formatted}`,
              date: formatted,
              type: "basic",
              options: [],
            });
          }
        }
      }

      // すでに drag されたイベントはそのまま、再生成はしない
      setCalendarEvents((prev) => [
        ...prev.filter((e) => !(e.type === "basic" && !e.options.length)),
        ...newEvents,
      ]);
    };

    generateBaseEvents();
  }, [selectedDays]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">新規予約作成</h1>

      <ChildSelector children={children} />

      {selectedChild ? (
        <>
          {/* ステップ切り替え */}
          {activeStep === 0 && (
            <Step1
              weeklyUsage={weeklyUsage}
              setWeeklyUsage={setWeeklyUsage}
              selectedDays={selectedDays}
              setSelectedDays={setSelectedDays}
            />
          )}
          {activeStep === 1 && (
            <Step2
              spotDays={spotDays}
              setSpotDays={setSpotDays}
              spotSelectedDates={spotSelectedDates}
              setSpotSelectedDates={setSpotSelectedDates}
            />
          )}

          <ReservationCalendar
            reservations={calendarEvents}
            editable
            allowClick
            onDateClick={handleDateClick}
          />

          <div className="flex justify-end gap-2 pt-4">
            {activeStep > 0 && (
              <button
                className="text-gray-600 hover:underline"
                onClick={() => setActiveStep((prev) => prev - 1)}
              >
                戻る
              </button>
            )}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() =>
                setActiveStep((prev) => (prev < 1 ? prev + 1 : prev))
              }
            >
              {activeStep === 1 ? "確認へ" : "次へ"}
            </button>
          </div>
        </>
      ) : (
        <p>子どもを選択してください。</p>
      )}
    </div>
  );
}
