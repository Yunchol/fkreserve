"use client";

import { Move, PlusCircle, Settings2, CheckCircle2, XCircle, CheckCircle, Loader2 } from "lucide-react";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function LeftSidebar({ onConfirm, onCancel, isLoading }: Props) {

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
              ② オプション追加/予約削除
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

      {/* ✅ ボタンセクション（シンプル＆均等） */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition
            ${isLoading
              ? "bg-blue-400 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              保存
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
        >
          <XCircle className="w-4 h-4" />
          取消
        </button>
      </div>
    </div>
  );
}
