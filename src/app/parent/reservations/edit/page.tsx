"use client";

import { useEffect, useState } from "react";
import ReservationCalendar from "@/components/ReservationCalendar";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { postReservations } from "@/lib/api/reservation";
import ReservationModal from "@/components/ReservationModal";
import { DateClickArg } from "@fullcalendar/interaction";
import LeftSidebar from "@/components/LeftSidebar";
import { Reservation, ReservationOption } from "@/types/reservation";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type Child = {
  id: string;
  name: string;
  reservations: Reservation[];
};

export default function CalendarEditPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [editedChildren, setEditedChildren] = useState<Child[]>([]);
  const { selectedChildId } = useChildStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const startOfNextMonth = new Date();
  startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
  startOfNextMonth.setDate(1);

  const nextMonthStr = format(startOfNextMonth, "yyyy-MM");
  const isDisabledDate = (dateStr: string) => !dateStr.startsWith(nextMonthStr);

  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/parent/reservations");
      const data = await res.json();
      setChildren(data.children);
      setEditedChildren(structuredClone(data.children));
    };
    fetchReservations();
  }, []);

  const selectedChild = editedChildren.find((c) => c.id === selectedChildId);

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

  const handleReservationSubmit = (
    type: "basic" | "spot",
    options: ReservationOption
  ) => {
    if (!selectedChildId) return;

    if (editingReservation) {
      setEditedChildren(prev =>
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
    } else {
      if (!selectedDate) return;

      const newId = `${selectedChildId}-${selectedDate}`;
      const newReservation: Reservation = {
        id: newId,
        date: selectedDate,
        type,
        options,
      };

      setEditedChildren(prev =>
        prev.map(child =>
          child.id === selectedChildId
            ? {
                ...child,
                reservations: [...child.reservations, newReservation],
              }
            : child
        )
      );
    }

    setShowModal(false);
    setSelectedDate(null);
    setEditingReservation(null);
  };

  const handleReservationMove = (reservationId: string, newDate: string) => {
    setEditedChildren(prev => {
      const updated = [...prev];
      const child = updated.find(c => c.id === selectedChildId);
      if (!child) return prev;

      const reservation = child.reservations.find(r => r.id === reservationId);
      if (!reservation) return prev;

      reservation.date = newDate;
      return updated;
    });
  };

  const handleEventClick = (reservationId: string) => {
    const child = editedChildren.find(c => c.id === selectedChildId);
    const reservation = child?.reservations.find(r => r.id === reservationId);
    if (reservation) {
      setEditingReservation(reservation);
      setSelectedDate(null);
      setShowModal(true);
    }
  };

  const handleDelete = (reservationId: string) => {
    setEditedChildren(prev =>
      prev.map(child =>
        child.id === selectedChildId
          ? {
              ...child,
              reservations: child.reservations.filter(r => r.id !== reservationId),
            }
          : child
      )
    );

    setShowModal(false);
    setEditingReservation(null);
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    const current = children.find(c => c.id === selectedChildId);
    const edited = editedChildren.find(c => c.id === selectedChildId);
    if (!current || !edited) return;
  
    const reservations = edited.reservations.map(r => ({
      date: r.date,
      type: r.type,
      options: r.options,
    }));
  
    try {
      await postReservations(
        selectedChildId!,
        reservations,
        {
          weeklyCount: 0,
          weekdays: [],
        },
        nextMonthStr,
        {}
      );
  
      setChildren(structuredClone(editedChildren));
      alert("保存しました！");
      router.push("/parent/reservations"); // ✅ 保存完了後に画面遷移

    } catch (e) {
      alert("保存に失敗しました");
    } finally{
      setIsLoading(false);
    }
  };
  

  const handleCancel = () => {
    if (confirm("編集を破棄して元に戻しますか？")) {
      setEditedChildren(structuredClone(children));
    }
  };

  return (
    <div className="p-4">
      <ChildSelector children={children} />
      <h1 className="text-xl font-semibold mb-4">予約カレンダー（編集）</h1>

      {selectedChild ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          <div className="md:col-span-3 space-y-4">
          <LeftSidebar onConfirm={handleConfirm} onCancel={handleCancel} isLoading={isLoading} />
          </div>

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
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
