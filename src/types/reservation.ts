 export type ReservationOption = {
    lunch: boolean;
    dinner: boolean;
    car: {
      schoolCar: {
        enabled: boolean;
        count: number;
        time: string;
      };
      homeCar: {
        enabled: boolean;
        count: number;
        time: string;
      };
      lessonCar: {
        enabled: boolean;
        count: number;
        name: string;
        time: string;
      };
    };
  };
  
  export type Reservation = {
    id: string;
    date: string;
    type: "basic" | "spot";
    options: ReservationOption;
    childId?: string;
    createdAt?: string;
  };
  