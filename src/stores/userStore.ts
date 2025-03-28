//Zustandでグローバルに状態保存

import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "parent" | "staff" | "pending";
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
