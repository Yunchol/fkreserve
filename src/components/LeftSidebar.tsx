"use client";

import { useRouter } from "next/navigation";
import { Move, PlusCircle, Settings2 } from "lucide-react";

export default function LeftSidebar() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="p-4 border border-gray-300 rounded bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">操作手順</h2>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
              <Move className="w-4 h-4" />
              ① 振替
            </div>
            <p className="ml-6 mt-1 text-gray-600">
              ➡︎ イベント（
              <span className="text-blue-600 font-semibold">青</span>／
              <span className="text-green-600 font-semibold">緑</span>
              ）を持ち上げて移動
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
              <Settings2 className="w-4 h-4" />
              ② オプション追加・削除
            </div>
            <p className="ml-6 mt-1 text-gray-600">
              ➡︎ イベント（
              <span className="text-blue-600 font-semibold">青</span>／
              <span className="text-green-600 font-semibold">緑</span>
              ）をクリックして操作
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
              <PlusCircle className="w-4 h-4" />
              ③ スポット追加
            </div>
            <p className="ml-6 mt-1 text-gray-600">
              ➡︎ 空白の日を押して利用日を追加（スポットのみ）
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/parent/reservations")}
        className="w-full px-4 py-2 text-sm font-semibold rounded bg-gray-700 text-white hover:bg-gray-900 transition"
        >
        更新を完了する
        </button>


    </div>
  );
}
