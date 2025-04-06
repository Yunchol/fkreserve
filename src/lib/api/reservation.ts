// lib/api/reservation.ts
import { ReservationOption } from "@/types/reservation";

// 🔁 ReservationOption を DB保存用 Option[] に変換
function convertOptionToArray(options: ReservationOption) {
  const result: {
    type: string;
    count: number;
    time?: string;
    lessonName?: string;
  }[] = [];

  if (options.lunch) {
    result.push({ type: "lunch", count: 1 });
  }

  if (options.dinner) {
    result.push({ type: "dinner", count: 1 });
  }

  const car = options.car;

  if (car.schoolCar.enabled) {
    result.push({
      type: "school_car",
      count: car.schoolCar.count,
      time: car.schoolCar.time,
    });
  }

  if (car.homeCar.enabled) {
    result.push({
      type: "home_car",
      count: car.homeCar.count,
      time: car.homeCar.time,
    });
  }

  if (car.lessonCar.enabled) {
    result.push({
      type: "lesson_car",
      count: car.lessonCar.count,
      time: car.lessonCar.time,
      lessonName: car.lessonCar.name,
    });
  }

  return result;
}

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
      options: convertOptionToArray(options),
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

// 🔸一括登録
export const postReservations = async (
  childId: string,
  reservations: {
    date: string;
    type: "basic" | "spot";
    options: ReservationOption;
  }[]
) => {
  const res = await fetch("/api/parent/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      childId,
      reservations: reservations.map((r) => ({
        ...r,
        options: convertOptionToArray(r.options),
      })),
    }),
  });

  if (!res.ok) {
    throw new Error("予約の作成に失敗しました");
  }

  return res.json();
};
