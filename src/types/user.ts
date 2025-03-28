// src/types/user.ts
export type User = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "parent" | "staff" | "pending";
    createdAt: string; // DateでもOK、APIレスポンスならstringが安心
  };
  
  