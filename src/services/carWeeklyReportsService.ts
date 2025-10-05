import { supabase } from "../lib/supabase";
import { WeeklyReport } from "../types";

interface GetCarWeeklyReportsResponse {
  success: boolean;
  reports?: WeeklyReport[];
  error?: string;
}

export const carWeeklyReportsService = {
  /**
   * Get weekly reports for a specific car using the edge function
   * This ensures proper authorization checks are performed
   */
  async getCarWeeklyReports(carId: string): Promise<WeeklyReport[]> {
    try {
      // Get the current session to get the access token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Not authenticated");
      }

      // Call the edge function
      const { data, error } =
        await supabase.functions.invoke<GetCarWeeklyReportsResponse>(
          "get_car_weekly_reports",
          {
            body: { car_id: carId },
          }
        );

      if (error) {
        console.error("Error calling get_car_weekly_reports function:", error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to fetch weekly reports");
      }

      return data.reports || [];
    } catch (error) {
      console.error("Error fetching car weekly reports:", error);
      throw error;
    }
  },

  /**
   * Get weekly reports for a car with optional filtering by year and month
   */
  async getCarWeeklyReportsFiltered(
    carId: string,
    year?: number,
    month?: number
  ): Promise<WeeklyReport[]> {
    const reports = await this.getCarWeeklyReports(carId);

    // Apply client-side filtering if year or month is provided
    let filteredReports = reports;

    if (year) {
      filteredReports = filteredReports.filter((report) => {
        const reportYear = new Date(report.week_start_date).getFullYear();
        return reportYear === year;
      });
    }

    if (month && year) {
      filteredReports = filteredReports.filter((report) => {
        const reportDate = new Date(report.week_start_date);
        return (
          reportDate.getFullYear() === year &&
          reportDate.getMonth() === month - 1
        );
      });
    }

    return filteredReports;
  },

  /**
   * Get weekly reports for multiple cars
   */
  async getMultipleCarsWeeklyReports(
    carIds: string[]
  ): Promise<Record<string, WeeklyReport[]>> {
    const results: Record<string, WeeklyReport[]> = {};

    // Fetch reports for each car in parallel
    await Promise.all(
      carIds.map(async (carId) => {
        try {
          results[carId] = await this.getCarWeeklyReports(carId);
        } catch (error) {
          console.error(`Error fetching reports for car ${carId}:`, error);
          results[carId] = [];
        }
      })
    );

    return results;
  },

  /**
   * Get all weekly reports for multiple cars combined
   */
  async getAllReportsForCars(carIds: string[]): Promise<WeeklyReport[]> {
    const reportsMap = await this.getMultipleCarsWeeklyReports(carIds);
    const allReports = Object.values(reportsMap).flat();

    // Sort by week_start_date descending
    return allReports.sort((a, b) => {
      return (
        new Date(b.week_start_date).getTime() -
        new Date(a.week_start_date).getTime()
      );
    });
  },
};
