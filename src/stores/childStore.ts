// src/stores/childStore.ts
import { create } from "zustand";

type ChildStore = {
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
};

export const useChildStore = create<ChildStore>((set) => ({
  selectedChildId: null,
  setSelectedChildId: (id) => set({ selectedChildId: id }),
}));
