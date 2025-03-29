// lib/api/reservation.ts
export async function postReservation(data: {
    childId: string;
    date: string;
    type: "basic" | "spot";
    options: string[];
  }) {
    const res = await fetch("/api/parent/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      throw new Error("予約の送信に失敗しました");
    }
  
    return await res.json(); // 登録された予約情報など
  }
  