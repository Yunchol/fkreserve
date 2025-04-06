import { ReservationOption } from "@/types/reservation";

export function convertOptionsToArray(opt: ReservationOption) {
    const options = [];
  
    if (opt.lunch) {
      options.push({ type: "lunch", count: 1 });
    }
  
    if (opt.dinner) {
      options.push({ type: "dinner", count: 1 });
    }
  
    const { car } = opt;
  
    if (car.schoolCar.enabled) {
      options.push({
        type: "school_car",
        count: car.schoolCar.count,
        time: car.schoolCar.time,
      });
    }
  
    if (car.homeCar.enabled) {
      options.push({
        type: "home_car",
        count: car.homeCar.count,
        time: car.homeCar.time,
      });
    }
  
    if (car.lessonCar.enabled) {
      options.push({
        type: "lesson_car",
        count: car.lessonCar.count,
        time: car.lessonCar.time,
        lessonName: car.lessonCar.name,
      });
    }
  
    return options;
  }

export function convertArrayToOptions(optionsArray: any[]): ReservationOption {
  const result: ReservationOption = {
    lunch: false,
    dinner: false,
    car: {
      schoolCar: { enabled: false, count: 0, time: "" },
      homeCar: { enabled: false, count: 0, time: "" },
      lessonCar: { enabled: false, count: 0, name: "", time: "" },
    },
  };

  optionsArray.forEach(opt => {
    if (opt.type === "lunch") {
      result.lunch = true;
    } else if (opt.type === "dinner") {
      result.dinner = true;
    } else if (opt.type === "school_car") {
      result.car.schoolCar.enabled = true;
      result.car.schoolCar.count = opt.count;
      result.car.schoolCar.time = opt.time;
    } else if (opt.type === "home_car") {
      result.car.homeCar.enabled = true;
      result.car.homeCar.count = opt.count;
      result.car.homeCar.time = opt.time;
    } else if (opt.type === "lesson_car") {
      result.car.lessonCar.enabled = true;
      result.car.lessonCar.count = opt.count;
      result.car.lessonCar.time = opt.time;
      result.car.lessonCar.name = opt.lessonName;
    }
  });

  return result;
}
