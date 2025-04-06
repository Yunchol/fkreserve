import { ReservationOption } from "@/types/reservation";

function convertOptionsToArray(opt: ReservationOption) {
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
  