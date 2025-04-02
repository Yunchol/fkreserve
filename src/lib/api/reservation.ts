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
