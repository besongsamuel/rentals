// Helper function to get the start of the week (Sunday)
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is 0
  return new Date(d.setDate(diff));
};

// Helper function to get the end of the week (Saturday)
export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

// Helper function to format date as YYYY-MM-DD
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Helper function to get current week dates
export const getCurrentWeek = () => {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  return {
    start: formatDateForInput(weekStart),
    end: formatDateForInput(weekEnd),
  };
};

// Helper function to navigate to previous/next week
export const navigateWeek = (
  currentStartDate: string,
  direction: "prev" | "next"
) => {
  const currentDate = new Date(currentStartDate);
  const newDate = new Date(currentDate);
  newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));

  const weekStart = getWeekStart(newDate);
  const weekEnd = getWeekEnd(newDate);

  return {
    start: formatDateForInput(weekStart),
    end: formatDateForInput(weekEnd),
  };
};

// Helper function to calculate mileage for new report
export const calculateMileageForNewReport = (
  carId: string,
  assignedCars: any[],
  existingReports: any[]
) => {
  // Find the selected car
  const selectedCar = assignedCars.find((car) => car.id === carId);
  if (!selectedCar) {
    return { startMileage: 0, endMileage: 1 };
  }

  // Get car's initial mileage
  const initialMileage = selectedCar.initial_mileage || 0;

  // Calculate sum of all previous reports' mileages for this car
  const totalReportMileage = existingReports
    .filter((report) => report.car_id === carId)
    .reduce((sum, report) => {
      const reportMileage =
        (report.end_mileage || 0) - (report.start_mileage || 0);
      return sum + reportMileage;
    }, 0);

  // Calculate start mileage: initial mileage + sum of all previous report mileages
  const startMileage = initialMileage + totalReportMileage;

  // End mileage is start mileage + 1
  const endMileage = startMileage + 1;

  return { startMileage, endMileage };
};
