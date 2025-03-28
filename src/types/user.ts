// src/types/user.ts
export type User = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "parent" | "staff" | "pending";
    profileCompleted: boolean;
    createdAt: string; // DateでもOK、APIレスポンスならstringが安心

  };
  
  