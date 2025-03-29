// src/components/ChildSelector.tsx
"use client";

import { useChildStore } from "@/stores/childStore";

type Child = {
  id: string;
  name: string;
};

type Props = {
  children: Child[];
};

export default function ChildSelector({ children }: Props) {
  const { selectedChildId, setSelectedChildId } = useChildStore();

  return (
    <div className="mb-4">
      <label className="mr-2 font-medium">子どもを選択：</label>
      <select
        value={selectedChildId ?? ""}
        onChange={(e) => setSelectedChildId(e.target.value)}
        className="border px-2 py-1 rounded"
      >
        <option value="" disabled>
          選択してください
        </option>
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
