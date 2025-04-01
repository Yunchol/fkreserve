"use client";

import { useEffect, useState } from "react";
import ReservationCalendar from "@/components/ReservationCalendar";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { postReservation } from "@/lib/api/reservation";
import ReservationModal from "@/components/ReservationModal";

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

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { selectedChildId } = useChildStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);


  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/parent/reservations");
      const data = await res.json();
      setChildren(data.children);
    };
    fetchReservations();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const handleDateClick = (date: string) => {
    console.log("クリックした日付:", date); 
    setSelectedDate(date);
    setShowModal(true);
  };

    const handleReservationSubmit = async (
      type: "basic" | "spot",
      options: string[]
    ) => {
      if (!selectedChildId) return;
    
      // 更新処理の場合
      if (editingReservation) {
        try {
          // 1. サーバーにPATCHリクエスト
          await fetch("/api/parent/reservations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reservationId: editingReservation.id,
              type,
              options,
            }),
          });
    
          // 2. フロント側の状態を更新
          setChildren((prev) =>
            prev.map((child) =>
              child.id === selectedChildId
                ? {
                    ...child,
                    reservations: child.reservations.map((r) =>
                      r.id === editingReservation.id
                        ? { ...r, type, options }
                        : r
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
    
        return;
      }
    
      // 🔽 新規予約処理（今までのやつ）
      if (!selectedDate) return;
    
      try {
        await postReservation({
          childId: selectedChildId,
          date: selectedDate,
          type,
          options,
        });
    
        setChildren((prev) =>
          prev.map((child) =>
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
    
        alert("予約完了！");
        setShowModal(false);
        setSelectedDate(null);
      } catch (err) {
        alert("送信エラー");
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
    
        // 日付更新
        child.reservations[reservationIndex].date = newDate;
        return updated;
        });
    
        // サーバーにも反映したいならAPI呼ぶ（例）
        try {
        await fetch("/api/parent/reservations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reservationId, newDate }),
        });
        } catch (err) {
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
        <h1 className="text-xl font-semibold mb-4">予約カレンダー</h1>
        {selectedChild ? (
          <ReservationCalendar
            reservations={selectedChild.reservations}
            onDateClick={handleDateClick}
            onReservationMove={handleReservationMove}
            onEventClick={handleEventClick}
          />
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
              // 削除処理（ローカルステートとAPI両方）
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
