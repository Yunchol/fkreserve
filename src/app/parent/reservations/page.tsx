"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { useChildStore } from "@/stores/childStore";
import ChildSelector from "@/components/ChildSelector";
import { useRouter } from "next/navigation";
import { Reservation, ReservationOption } from "@/types/reservation";
import { Loader2 } from "lucide-react";

type Child = {
  id: string;
  name: string;
  reservations: Reservation[];
};

export default function ReservationPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const { selectedChildId } = useChildStore();
  const [events, setEvents] = useState<any[]>([]);

  // ✅ スピナー状態を個別に
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoadingChildren(true);
      try {
        const res = await fetch("/api/parent/reservations");
        const data = await res.json();
        setChildren(data.children);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchReservations();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  useEffect(() => {
    if (!selectedChild) return;
  
    setLoadingCalendar(true);
  
    const timer = setTimeout(() => {
      const mapped = selectedChild.reservations.map((res) => {
        const opts: ReservationOption = res.options ?? {
          lunch: false,
          dinner: false,
          car: {
            schoolCar: { enabled: false, count: 0, time: "" },
            homeCar: { enabled: false, count: 0, time: "" },
            lessonCar: { enabled: false, count: 0, name: "", time: "" },
          },
        };
  
        const parts: string[] = [];
        if (opts.lunch) parts.push("・昼食");
        if (opts.dinner) parts.push("・夕食");
  
        if (opts.car.schoolCar.enabled)
          parts.push(`・学校送迎(${opts.car.schoolCar.count}回)`);
        if (opts.car.homeCar.enabled)
          parts.push(`・自宅送迎(${opts.car.homeCar.count}回)`);
        if (opts.car.lessonCar.enabled) {
          const name = opts.car.lessonCar.name || "習い事";
          parts.push(`・${name}送迎(${opts.car.lessonCar.count}回)`);
        }
  
        return {
          id: res.id,
          title: `${res.type === "basic" ? "基本" : "スポット"}利用<br />${parts.join("<br />")}`,
          start: res.date,
          allDay: true,
          color: res.type === "basic" ? "#3B82F6" : "#10B981", // ✅ ここで色分け
          textColor: "white",
        };
      });
  
      setEvents(mapped);
      setLoadingCalendar(false);
    }, 300);
  
    return () => clearTimeout(timer);
  }, [selectedChild]);
  

  return (
    <div className="p-4">
      {/* ▼ 上部バー：セレクター + ボタン */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
      <div className="relative min-h-[44px]"> {/* ← 高さを合わせる */}
        {loadingChildren && (
          <div className="absolute inset-x-0 top-0 bottom-3 bg-white/80 z-10 flex items-center justify-center rounded">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        )}
        <ChildSelector children={children} />
      </div>


      <div className="flex gap-2">
        {/* 新規予約ボタン */}
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-4 py-2 rounded-md transition duration-150 text-sm"
          onClick={() => router.push("/parent/reservations/new")}
        >
          ＋ 新規予約
        </button>

        {/* 編集ボタン */}
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-4 py-2 rounded-md transition duration-150 text-sm"
          onClick={() => router.push("/parent/reservations/edit")}
        >
          ✎ 予約を編集
        </button>
      </div>

      </div>

      <h1 className="text-lg font-semibold mb-4">予約状況カレンダー</h1>

      <div className={`relative min-h-[200px] rounded ${selectedChild ? "bg-white shadow p-4" : "bg-transparent"}`}>
      {/* カレンダー読み込み中オーバーレイ */}
      {loadingCalendar && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded">
          <div className="flex flex-col items-center text-gray-600 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">カレンダー読み込み中...</p>
          </div>
        </div>
      )}

      {selectedChild ? (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ja"
          events={events}
          editable={false}
          selectable={false}
          height="auto"
          eventContent={(arg) => {
            return {
              html: `<div style="white-space: normal; font-size: 0.85rem;">${arg.event.title}</div>`,
            };
          }}
        />
      ) : (
        !loadingChildren && (
          <p className="text-gray-600 p-4">子どもを選択してください</p>
        )
      )}
    </div>

    </div>
  );
}
