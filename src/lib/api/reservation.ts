import { Reservation } from "@/types/reservation";

export async function postReservation({
  childId,
  date,
  type,
  options,
}: {
  childId: string;
  date: string;
  type: "basic" | "spot";
  options: string[];
}) {
  const res = await fetch("/api/parent/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ childId, date, type, options }),
  });

  if (res.status === 409) {
    throw new Error("この日はすでに予約があります");
  }

  if (!res.ok) {
    throw new Error("予約作成に失敗しました");
  }

  return res.json(); // { reservation: ... }
}

// 🔄 予約一括削除（来月の予約）
export const deleteNextMonthReservations = async (childId: string, month: string) => {
  const res = await fetch("/api/parent/reservations", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ childId, month }), // 例: { childId: "abc", month: "2025-05" }
  });

  if (!res.ok) {
    throw new Error("予約の削除に失敗しました");
  }
};


export const postReservations = async (childId: string, reservations: Reservation[]) => {
  const res = await fetch("/api/parent/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ childId, reservations }),
  });

  if (!res.ok) {
    throw new Error("予約の作成に失敗しました");
  }

  return res.json();
};

