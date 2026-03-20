// Week runs Monday (start) through Sunday (end); getDay(): 0 = Sun … 6 = Sat
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const daysFromMonday = (day + 6) % 7;
  d.setDate(d.getDate() - daysFromMonday);
  return d;
};

export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate()
  );
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
};

// Local calendar YYYY-MM-DD (avoid UTC shift from toISOString)
export const formatDateForInput = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

/** Parses YYYY-MM-DD as local calendar date (avoids UTC shift). */
export const parseLocalDateOnly = (isoDate: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) {
    return null;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d, 12, 0, 0);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
};

/**
 * Format a Postgres DATE / date-only value for display without timezone shifts.
 * Takes the calendar day from the string (YYYY-MM-DD before `T` or space); does not
 * parse as UTC instant.
 */
export const formatSqlDateOnlyForDisplay = (
  dateString: string | null | undefined,
  locale?: string | string[],
  options?: Intl.DateTimeFormatOptions
): string => {
  if (dateString == null || dateString === "") {
    return "";
  }
  const datePart = String(dateString).trim().split("T")[0].split(" ")[0];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!m) {
    return datePart;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const local = new Date(y, mo, d);
  if (
    local.getFullYear() !== y ||
    local.getMonth() !== mo ||
    local.getDate() !== d
  ) {
    return datePart;
  }
  return local.toLocaleDateString(locale, options);
};

/**
 * Whole-week offset from today's week: 0 = this week, 1 = next, -1 = last, etc.
 * Weeks are Monday-start (see getWeekStart).
 */
export const getWeekOffsetFromToday = (weekStartDate: string): number | null => {
  const selected = parseLocalDateOnly(weekStartDate);
  if (!selected) {
    return null;
  }
  const today = new Date();
  const todayNoon = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
    0,
    0
  );
  const selectedMonday = getWeekStart(selected);
  const todayMonday = getWeekStart(todayNoon);
  const diffMs = selectedMonday.getTime() - todayMonday.getTime();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.round(diffMs / oneWeekMs);
};

// Helper function to navigate to previous/next week
export const navigateWeek = (
  currentStartDate: string,
  direction: "prev" | "next"
) => {
  const parsed = parseLocalDateOnly(currentStartDate);
  if (!parsed) {
    return getCurrentWeek();
  }

  const delta = direction === "next" ? 7 : -7;
  const moved = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate() + delta,
    12,
    0,
    0
  );

  const weekStart = getWeekStart(moved);
  const weekEnd = getWeekEnd(moved);

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
