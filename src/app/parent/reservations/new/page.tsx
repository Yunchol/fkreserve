"use client";

import { useEffect, useState } from "react";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import ReservationCalendar from "@/components/ReservationCalendar";
import Step1 from "@/components/Step1";
import Step2 from "@/components/Step2";
import Step3 from "@/components/Step3";
import ReservationModal from "@/components/ReservationModal";
import { Reservation, ReservationOption } from "@/types/reservation";
import { DateClickArg } from "@fullcalendar/interaction";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { postReservations, deleteNextMonthReservations } from "@/lib/api/reservation";
import { summarizeOptions } from "@/lib/utils/summarizeOptions";
// UIレイアウトを左右分割に変更
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
  const weekdays = Object.entries(selectedDays)
  .filter(([, v]) => v)
  .map(([day]) => day);

  const [spotDays, setSpotDays] = useState(0);
  const [spotSelectedDates, setSpotSelectedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const [children, setChildren] = useState<any[]>([]);
  const { selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const router = useRouter();
  //FullCalendarの表示日時範囲
  const startOfNextMonth = new Date();
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
    startOfNextMonth.setDate(1);

    const endOfNextMonth = new Date(
      startOfNextMonth.getFullYear(),
      startOfNextMonth.getMonth() + 1,
      0
    );


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
          options: {
            lunch: false,
            dinner: false,
            car: {
              schoolCar: { enabled: false, count: 0, time: "" },
              homeCar: { enabled: false, count: 0, time: "" },
              lessonCar: { enabled: false, count: 0, name: "", time: "" },
            }
          }
        }
      ]);
      
    }
  };

  const handleEventClick = (reservationId: string) => {
    const reservation = calendarEvents.find((r) => r.id === reservationId);
    if (reservation) setEditingReservation(reservation);
  };

  const handleModalClose = () => setEditingReservation(null);

  const handleModalSubmit = (type: "basic" | "spot", options: ReservationOption) => {
    if (!editingReservation) return;
  
    setCalendarEvents((prev) =>
      prev.map((r) =>
        r.id === editingReservation.id ? { ...r, options } : r
      )
    );
  
    handleModalClose();
  };

  useEffect(() => {
    const generateBaseEvents = () => {
      const newEvents: Reservation[] = [];
  
      const startOfMonth = new Date();
      startOfMonth.setMonth(startOfMonth.getMonth() + 1);
      startOfMonth.setDate(1);
  
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

          // ✅ OK: 例えば lunch, dinner, car に一つでも true があるかをチェック
      const isEmptyOptions = (options: Reservation["options"]) =>
        !options.lunch &&
        !options.dinner &&
        !options.car.schoolCar.enabled &&
        !options.car.homeCar.enabled &&
        !options.car.lessonCar.enabled;
      
  
      for (
        let date = new Date(startOfMonth);
        date <= endOfMonth;
        date.setDate(date.getDate() + 1)
      ) {
        const dayName = date.toLocaleDateString("ja-JP", { weekday: "long" });
        const formattedDate = format(date, "yyyy-MM-dd");
  
        if (selectedDays[dayName]) {
          const existing = calendarEvents.find(
            (e) => e.date === formattedDate && e.type === "basic"
          );
  
          if (!existing || isEmptyOptions(existing.options)) {
            newEvents.push({
              id: `basic-${formattedDate}`,
              date: formattedDate,
              type: "basic",
              // ✅ OK: ReservationOption 型に合わせる
              options: {
                lunch: false,
                dinner: false,
                car: {
                  schoolCar: { enabled: false, count: 0, time: "" },
                  homeCar: { enabled: false, count: 0, time: "" },
                  lessonCar: { enabled: false, count: 0, name: "", time: "" },
                }
              }
            });
          }
        }
      }
  
      setCalendarEvents((prev) => [
        ...prev.filter((e) => !(e.type === "basic" && isEmptyOptions(e.options))),
        ...newEvents,
      ]);
      
    };
  
    generateBaseEvents();
  }, [selectedDays]);
  
  

  const handleSave = async () => {
    if (!selectedChildId) {
      alert("お子さまが選択されていません");
      return;
    }
  
    // 来月の年月を文字列で取得（例："2025-05"）
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthStr = format(nextMonth, "yyyy-MM");
  
    try {
      // 来月分の予約を削除
      await deleteNextMonthReservations(selectedChildId, nextMonthStr);
  
      // 来月の予約のみ抽出
      const toSave = calendarEvents.filter((r) =>
        r.date.startsWith(nextMonthStr)
      );
  
      if (toSave.length === 0) {
        alert("来月の予約が1件もありません。");
        return;
      }
  
      // ✅ 選択された曜日を配列に変換
      const weekdays = Object.entries(selectedDays)
        .filter(([, v]) => v)
        .map(([day]) => day);
  
      // ✅ 保存リクエスト送信（予約＋BasicUsage+monthlyUsageまとめて）
      await postReservations(
        selectedChildId,
        toSave,
        {
          weeklyCount: weeklyUsage,
          weekdays,
        },
        nextMonthStr,
        summarizeOptions(toSave) // ← 追加！
      );
  
      alert("予約を保存しました！");
      router.push("/parent/reservations");
    } catch (err) {
      console.error("保存エラー", err);
      alert("保存に失敗しました。");
    }
  };
  

  console.log("selectedDays:", selectedDays);
  console.log("spotDays:", spotDays);
  console.log("calendarEvents:", calendarEvents);
  console.log("selectedChildId:", selectedChildId);

  
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">新規予約作成</h1>
      <ChildSelector children={children} />
  
      {selectedChild ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          {/* 左カラム：ステップ切り替え + 入力エリア */}
          <div className="md:col-span-3 space-y-6">
            {/* ステップナビゲーション */}
            <div className="space-y-2">
              {["基本利用", "スポット利用", "オプション選択", "確認・送信"].map((label, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded cursor-pointer text-sm ${
                    activeStep === index
                      ? "bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-500"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  
                >
                  Step {index + 1}：{label}
                </div>
              ))}
            </div>
  
            {/* 各ステップの入力エリア */}
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
  
            {activeStep === 2 && (
              <Step3
                calendarEvents={calendarEvents}
                setCalendarEvents={setCalendarEvents}
              />
            )}
  
           {/* ナビボタン */}
           <div className="flex justify-between items-center pt-4">
            <button
              className="text-red-600 hover:underline"
              onClick={() => {
                if (confirm("ステップを中止して、最初の画面に戻りますか？")) {
                  router.push("/parent/reservations");
                }
              }}
            >
              中止してやり直す
            </button>

            {activeStep < 3 ? (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setActiveStep((prev) => prev + 1)}
              >
                {activeStep === 2 ? "確認へ" : "次へ"}
              </button>
            ) : (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSave}
              >
                保存する
              </button>
            )}
          </div>

          </div>
  
          {/* 右カラム：カレンダー（大きく表示） */}
          <div className="md:col-span-9">
          <ReservationCalendar
            reservations={calendarEvents}
            editable
            allowClick
            allowEventClick={activeStep === 2}
            mode="new"
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />

          </div>
        </div>
      ) : (
        <p>子どもを選択してください。</p>
      )}
  
      {/* モーダル */}
      {editingReservation && (
        <ReservationModal
          date={editingReservation.date}
          editingReservation={editingReservation}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
  
}

//新規作成のロジックもう一度考える
//api連携が少し複雑になってきた
