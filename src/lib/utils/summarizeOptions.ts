import { Reservation } from "@/types/reservation";

type OptionSummary = Record<string, Record<string, number>>;
// 例: { "2025-05": { lunch: 3, school_car: 2, lesson_car: 5 } }

export function summarizeOptions(events: Reservation[]): OptionSummary {
  const result: OptionSummary = {};

  for (const event of events) {
    const date = new Date(event.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const opt = event.options;

    if (!result[month]) result[month] = {};

    const add = (type: string, count: number) => {
      result[month][type] = (result[month][type] || 0) + count;
    };

    // 昼食・夕食（1回固定）
    if (opt.lunch) add("lunch", 1);
    if (opt.dinner) add("dinner", 1);

    // 各種送迎（count を見て加算）
    if (opt.car.schoolCar.enabled) add("school_car", opt.car.schoolCar.count || 1);
    if (opt.car.homeCar.enabled) add("home_car", opt.car.homeCar.count || 1);
    if (opt.car.lessonCar.enabled) add("lesson_car", opt.car.lessonCar.count || 1);
  }

  return result;
}
