"use client";

import { useEffect, useState } from "react";
import ReservationCalendar from "@/components/ReservationCalendar";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { postReservation } from "@/lib/api/reservation";
import ReservationModal from "@/components/ReservationModal";
import { DateClickArg } from "@fullcalendar/interaction";
import LeftSidebar from "@/components/LeftSidebar";
import { Reservation, ReservationOption } from "@/types/reservation"; // 型をインポート
import { format } from "date-fns";


type Child = {
  id: string;
  name: string;
  reservations: Reservation[];
};

export default function CalendarEditPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { selectedChildId } = useChildStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    // 📅 FullCalendar に渡す来月の日付範囲
  const startOfNextMonth = new Date();
  startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
  startOfNextMonth.setDate(1);

  const endOfNextMonth = new Date(
    startOfNextMonth.getFullYear(),
    startOfNextMonth.getMonth() + 1,
    0
  );

  const nextMonthStr = format(startOfNextMonth, "yyyy-MM"); // 例："2025-05"

// ❌ 来月以外なら無効
const isDisabledDate = (dateStr: string) => !dateStr.startsWith(nextMonthStr);


  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/parent/reservations");
      const data = await res.json();
      setChildren(data.children);
    };
    fetchReservations();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const handleDateClick = (info: DateClickArg) => {
    const date = info.dateStr;
  
    const alreadyExists = selectedChild?.reservations.some(r => r.date === date);
    if (alreadyExists) {
      alert("この日はすでに予約があります！");
      return;
    }
  
    setSelectedDate(date);
    setEditingReservation(null);
    setShowModal(true);
  };

  const handleReservationSubmit = async (
    type: "basic" | "spot",
    options: ReservationOption
  ) => {
    if (!selectedChildId) return;

    if (editingReservation) {
      // 既存予約の更新
      try {
        await fetch("/api/parent/reservations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservationId: editingReservation.id,
            type,
            options,
          }),
        });

        setChildren(prev =>
          prev.map(child =>
            child.id === selectedChildId
              ? {
                  ...child,
                  reservations: child.reservations.map(r =>
                    r.id === editingReservation.id ? { ...r, type, options } : r
                  ),
                }
              : child
          )
        );

        alert("予約を更新しました！");
        setShowModal(false);
        setEditingReservation(null);
      } catch (err) {
        alert("更新エラー");
      }
    } else {
      // 新規予約の追加
      if (!selectedDate) return;
      try {
        await postReservation({
          childId: selectedChildId,
          date: selectedDate,
          type, // UI上では "spot" 固定で渡る場合もあります
          options,
        });

        setChildren(prev =>
          prev.map(child =>
            child.id === selectedChildId
              ? {
                  ...child,
                  reservations: [
                    ...child.reservations,
                    {
                      id: `${selectedChildId}-${selectedDate}`,
                      date: selectedDate,
                      type,
                      options,
                    },
                  ],
                }
              : child
          )
        );

        alert("予約を作成しました！");
        setShowModal(false);
        setSelectedDate(null);
      } catch (err) {
        alert("作成エラー");
      }
    }
  };

  const handleReservationMove = async (reservationId: string, newDate: string) => {
    const childIndex = children.findIndex(c => c.id === selectedChildId);
    if (childIndex === -1) return;

    setChildren(prev => {
      const updated = [...prev];
      const child = updated[childIndex];
      const reservationIndex = child.reservations.findIndex(r => r.id === reservationId);
      if (reservationIndex === -1) return prev;

      child.reservations[reservationIndex].date = newDate;
      return updated;
    });

    try {
      await fetch("/api/parent/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, newDate }),
      });
    } catch {
      alert("サーバーへの更新に失敗しました");
    }
  };

  const handleEventClick = (reservationId: string) => {
    const reservation = selectedChild?.reservations.find(r => r.id === reservationId);
    if (reservation) {
      setEditingReservation(reservation);
      setSelectedDate(null);
      setShowModal(true);
    }
  };

  return (
    <div className="p-4">
      <ChildSelector children={children} />
      <h1 className="text-xl font-semibold mb-4">予約カレンダー（編集）</h1>
  
      {selectedChild ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          {/* 左カラム（仮のステップや設定エリア） */}
          <div className="md:col-span-3 space-y-4">
            <LeftSidebar />
          </div>

          {/* 右カラム（予約カレンダー） */}
          <div className="md:col-span-9">
            <ReservationCalendar
              reservations={selectedChild.reservations}
              editable
              allowClick
              allowEventClick
              mode="edit"
              onDateClick={handleDateClick}
              onReservationMove={handleReservationMove}
              onEventClick={handleEventClick}
              disabledDateFn={isDisabledDate}
            />
          </div>
        </div>
      ) : (
        <p>子どもを選択してください</p>
      )}
  
      {showModal && (selectedDate || editingReservation) && (
        <ReservationModal
          date={selectedDate ?? editingReservation?.date ?? ""}
          editingReservation={editingReservation}
          onClose={() => {
            setShowModal(false);
            setSelectedDate(null);
            setEditingReservation(null);
          }}
          onSubmit={handleReservationSubmit}
          onDelete={async (reservationId) => {
            setChildren(prev =>
              prev.map(child =>
                child.id === selectedChildId
                  ? {
                      ...child,
                      reservations: child.reservations.filter(r => r.id !== reservationId),
                    }
                  : child
              )
            );
  
            await fetch("/api/parent/reservations", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reservationId }),
            });
  
            setShowModal(false);
            setEditingReservation(null);
          }}
        />
      )}
    </div>
  );
  
}
