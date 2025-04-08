// lib/api/reservation.ts
import { ReservationOption } from "@/types/reservation";
import { convertOptionsToArray } from "../utils/convertOption";

// 🔸単体予約登録
export async function postReservation({
  childId,
  date,
  type,
  options,
}: {
  childId: string;
  date: string;
  type: "basic" | "spot";
  options: ReservationOption;
}) {
  const res = await fetch("/api/parent/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      childId,
      date,
      type,
      options: convertOptionsToArray(options),
    }),
  });

  if (res.status === 409) {
    throw new Error("この日はすでに予約があります");
  }

  if (!res.ok) {
    throw new Error("予約作成に失敗しました");
  }

  return res.json(); // { reservation: ... }
}

// 🔸一括削除（来月予約削除）
export const deleteNextMonthReservations = async (childId: string, month: string) => {
  const res = await fetch("/api/parent/reservations", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ childId, month }),
  });

  if (!res.ok) {
    throw new Error("予約の削除に失敗しました");
  }
};


// 🔸一括登録＋basicUsage付き＋optionSummary追加
export const postReservations = async (
  childId: string,
  reservations: {
    date: string;
    type: "basic" | "spot";
    options: ReservationOption;
  }[],
  basicUsage: {
    weeklyCount: number;
    weekdays: string[];
  },
  month: string,
  optionSummary: Record<string, Record<string, number>> // ← これを追加
) => {
  const res = await fetch("/api/parent/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      childId,
      month,
      basicUsage,
      optionSummary, // ← ここも追加！
      reservations: reservations.map((r) => ({
        ...r,
        options: convertOptionsToArray(r.options), // ✅ Option[] に変換して送信
      })),
    }),
  });

  if (!res.ok) {
    throw new Error("予約の作成に失敗しました");
  }

  return res.json();
};


