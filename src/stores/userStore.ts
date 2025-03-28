//Zustandでグローバルに状態保存

import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "parent" | "staff" | "pending";
};

type UserStore = {
  user: User | null;
  checked: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setChecked: (value: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      checked: false,
      setUser: (user) => set({ user, checked: true }),
      clearUser: () => set({ user: null, checked: true }),
      setChecked: (value) => set({ checked: value }),
    }),
    {
      name: "user-storage", // localStorageのキー
    }
  )
);
