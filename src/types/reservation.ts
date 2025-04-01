// types/reservation.ts
export type Reservation = {
    id: string;
    date: string; // Date の場合は `toISOString()` する or string 型に変換
    type: string;
    options: string[];
    childId?: string;
    createdAt?: string;
  };
  