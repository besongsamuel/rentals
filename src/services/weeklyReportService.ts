import { supabase } from "../lib/supabase";
import { CreateWeeklyReportData, WeeklyReport } from "../types";
import { carWeeklyReportsService } from "./carWeeklyReportsService";

export const weeklyReportService = {
  async calculateTotalEarnings(reportId: string): Promise<number> {
    try {
      const { data: report, error } = await supabase
        .from("weekly_reports")
        .select("ride_share_income, rental_income, taxi_income")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error("Error fetching report for earnings calculation:", error);
        return 0;
      }

      return (
        (report.ride_share_income || 0) +
        (report.rental_income || 0) +
        (report.taxi_income || 0)
      );
    } catch (error) {
      console.error("Error calculating total earnings:", error);
      return 0;
    }
  },

  async hasIncomeSources(reportId: string): Promise<boolean> {
    try {
      const { data: report, error } = await supabase
        .from("weekly_reports")
        .select("ride_share_income, rental_income, taxi_income")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error("Error fetching report for income check:", error);
        return false;
      }

      return (
        (report.ride_share_income || 0) > 0 ||
        (report.rental_income || 0) > 0 ||
        (report.taxi_income || 0) > 0
      );
    } catch (error) {
      console.error("Error checking income sources:", error);
      return false;
    }
  },

  async getReportWithCalculatedEarnings(
    reportId: string
  ): Promise<(WeeklyReport & { total_earnings: number }) | null> {
    try {
      const report = await this.getReportById(reportId);
      if (!report) return null;

      const totalEarnings = await this.calculateTotalEarnings(reportId);
      return { ...report, total_earnings: totalEarnings };
    } catch (error) {
      console.error("Error getting report with calculated earnings:", error);
      return null;
    }
  },
  async getReportsByDriver(driverId: string): Promise<WeeklyReport[]> {
    const { data, error } = await supabase
      .from("weekly_reports")
      .select("*")
      .eq("driver_id", driverId)
      .order("week_start_date", { ascending: false });

    if (error) {
      console.error("Error fetching weekly reports:", error);
      throw error;
    }

    return data || [];
  },

  async getReportsByCar(
    carId: string,
    year?: number,
    month?: number
  ): Promise<WeeklyReport[]> {
    // Use the edge function to fetch reports with proper authorization
    return await carWeeklyReportsService.getCarWeeklyReportsFiltered(
      carId,
      year,
      month
    );
  },

  async getReportsByCarWithTotalEarnings(
    carId: string,
    year?: number,
    month?: number
  ): Promise<(WeeklyReport & { total_earnings: number })[]> {
    const reports = await this.getReportsByCar(carId, year, month);

    // Calculate total earnings for each report from the new columns
    const reportsWithEarnings = reports.map((report) => {
      const totalEarnings =
        (report.ride_share_income || 0) + (report.rental_income || 0);
      return { ...report, total_earnings: totalEarnings };
    });

    return reportsWithEarnings;
  },

  async getReportById(reportId: string): Promise<WeeklyReport | null> {
    const { data, error } = await supabase
      .from("weekly_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error) {
      console.error("Error fetching weekly report:", error);
      return null;
    }

    return data;
  },

  async createReport(
    reportData: CreateWeeklyReportData & { driver_id: string }
  ): Promise<WeeklyReport> {
    const { data, error } = await supabase
      .from("weekly_reports")
      .insert({
        ...reportData,
        driver_earnings: reportData.driver_earnings || 0,
        maintenance_expenses: reportData.maintenance_expenses || 0,
        gas_expense: reportData.gas_expense || 0,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating weekly report:", error);
      throw error;
    }

    return data;
  },

  async updateReport(
    reportId: string,
    updates: Partial<WeeklyReport>
  ): Promise<WeeklyReport> {
    const { data, error } = await supabase
      .from("weekly_reports")
      .update(updates)
      .eq("id", reportId)
      .select()
      .single();

    if (error) {
      console.error("Error updating weekly report:", error);
      throw error;
    }

    return data;
  },

  async submitReport(reportId: string): Promise<WeeklyReport> {
    const { data, error } = await supabase
      .from("weekly_reports")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", reportId)
      .eq("status", "draft") // Only allow submitting draft reports
      .select()
      .single();

    if (error) {
      console.error("Error submitting weekly report:", error);
      if (error.code === "PGRST116") {
        throw new Error("Report not found or already submitted");
      }
      throw error;
    }

    if (!data) {
      throw new Error("Report not found or already submitted");
    }

    return data;
  },

  async approveReport(
    reportId: string,
    approvedBy: string
  ): Promise<WeeklyReport> {
    const { data, error } = await supabase
      .from("weekly_reports")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
      })
      .eq("id", reportId)
      .eq("status", "submitted") // Only allow approving submitted reports
      .select()
      .single();

    if (error) {
      console.error("Error approving weekly report:", error);
      if (error.code === "PGRST116") {
        throw new Error("Report not found or already processed");
      }
      throw error;
    }

    if (!data) {
      throw new Error("Report not found or already processed");
    }

    return data;
  },

  async rejectReport(
    reportId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<WeeklyReport> {
    const { data, error } = await supabase
      .from("weekly_reports")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        rejected_by: rejectedBy,
        rejection_reason: reason,
      })
      .eq("id", reportId)
      .eq("status", "submitted") // Only allow rejecting submitted reports
      .select()
      .single();

    if (error) {
      console.error("Error rejecting weekly report:", error);
      if (error.code === "PGRST116") {
        throw new Error("Report not found or already processed");
      }
      throw error;
    }

    if (!data) {
      throw new Error("Report not found or already processed");
    }

    return data;
  },

  async deleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from("weekly_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting weekly report:", error);
      throw error;
    }
  },

  async getTotalMileageForCar(carId: string): Promise<number> {
    try {
      // Use the edge function to fetch reports with proper authorization
      const reports = await carWeeklyReportsService.getCarWeeklyReports(carId);

      if (!reports || reports.length === 0) {
        return 0;
      }

      // Calculate total mileage driven from all reports
      const totalMileage = reports.reduce(
        (sum, report) => sum + (report.end_mileage - report.start_mileage),
        0
      );

      return totalMileage;
    } catch (error) {
      console.error("Error calculating total mileage for car:", error);
      return 0;
    }
  },

  async getCarStatistics(carId: string, startDate?: Date, endDate?: Date) {
    try {
      // Use the edge function to fetch reports with proper authorization
      let reports = await carWeeklyReportsService.getCarWeeklyReports(carId);

      // Apply date range filters client-side
      if (startDate || endDate) {
        reports = reports.filter((report) => {
          const reportDate = new Date(report.week_start_date);

          if (startDate && reportDate < startDate) {
            return false;
          }

          if (endDate && reportDate > endDate) {
            return false;
          }

          return true;
        });
      }

      // Sort by week_start_date ascending
      reports.sort((a, b) => {
        return (
          new Date(a.week_start_date).getTime() -
          new Date(b.week_start_date).getTime()
        );
      });

      if (!reports || reports.length === 0) {
        return {
          totalReports: 0,
          averageWeeklyMileage: 0,
          totalMileage: 0,
          averageWeeklyExpenses: 0,
          totalExpenses: 0,
          averageWeeklyGasExpenses: 0,
          totalGasExpenses: 0,
          averageWeeklyRideShareIncome: 0,
          totalRideShareIncome: 0,
          averageWeeklyRentalIncome: 0,
          totalRentalIncome: 0,
          averageWeeklyTaxiIncome: 0,
          totalTaxiIncome: 0,
          averageWeeklyDriverEarnings: 0,
          totalDriverEarnings: 0,
          averageWeeklyProfit: 0,
          totalProfit: 0,
          currency: "XAF",
        };
      }

      // Calculate statistics
      const totalReports = reports.length;
      const totalMileage = reports.reduce(
        (sum, report) => sum + (report.end_mileage - report.start_mileage),
        0
      );
      const totalExpenses = reports.reduce(
        (sum, report) => sum + (report.maintenance_expenses || 0),
        0
      );
      const totalGasExpenses = reports.reduce(
        (sum, report) => sum + (report.gas_expense || 0),
        0
      );
      const totalRideShareIncome = reports.reduce(
        (sum, report) => sum + (report.ride_share_income || 0),
        0
      );
      const totalRentalIncome = reports.reduce(
        (sum, report) => sum + (report.rental_income || 0),
        0
      );

      const totalTaxiIncome = reports.reduce(
        (sum, report) => sum + (report.taxi_income || 0),
        0
      );

      const totalDriverEarnings = reports.reduce(
        (sum, report) => sum + (report.driver_earnings || 0),
        0
      );
      const totalIncome =
        totalRideShareIncome + totalRentalIncome + totalTaxiIncome;
      const totalAllExpenses = totalExpenses + totalGasExpenses;
      const totalProfit = totalIncome;

      return {
        totalReports,
        averageWeeklyMileage: totalMileage / totalReports,
        totalMileage,
        averageWeeklyExpenses: totalExpenses / totalReports,
        totalExpenses,
        averageWeeklyGasExpenses: totalGasExpenses / totalReports,
        totalGasExpenses,
        averageWeeklyRideShareIncome: totalRideShareIncome / totalReports,
        totalRideShareIncome,
        averageWeeklyRentalIncome: totalRentalIncome / totalReports,
        totalRentalIncome,
        averageWeeklyTaxiIncome: totalTaxiIncome / totalReports,
        totalTaxiIncome,
        averageWeeklyDriverEarnings: totalDriverEarnings / totalReports,
        totalDriverEarnings,
        averageWeeklyProfit: totalProfit / totalReports,
        totalProfit,
        currency: reports[0]?.currency || "XAF",
      };
    } catch (error) {
      console.error("Error calculating car statistics:", error);
      throw error;
    }
  },

  async getReportCountForCar(carId: string): Promise<number> {
    try {
      // Use the edge function to fetch reports with proper authorization
      const reports = await carWeeklyReportsService.getCarWeeklyReports(carId);
      return reports.length;
    } catch (error) {
      console.error("Error getting report count for car:", error);
      return 0;
    }
  },
};
