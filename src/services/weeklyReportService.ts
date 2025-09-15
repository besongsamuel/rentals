import { supabase } from "../lib/supabase";
import { CreateWeeklyReportData, WeeklyReport } from "../types";

export const weeklyReportService = {
  async calculateTotalEarnings(reportId: string): Promise<number> {
    try {
      const { data: report, error } = await supabase
        .from("weekly_reports")
        .select("ride_share_income, rental_income")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error("Error fetching report for earnings calculation:", error);
        return 0;
      }

      return (report.ride_share_income || 0) + (report.rental_income || 0);
    } catch (error) {
      console.error("Error calculating total earnings:", error);
      return 0;
    }
  },

  async hasIncomeSources(reportId: string): Promise<boolean> {
    try {
      const { data: report, error } = await supabase
        .from("weekly_reports")
        .select("ride_share_income, rental_income")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error("Error fetching report for income check:", error);
        return false;
      }

      return (
        (report.ride_share_income || 0) > 0 || (report.rental_income || 0) > 0
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
    let query = supabase.from("weekly_reports").select("*").eq("car_id", carId);

    // Apply year filter if provided
    if (year) {
      const startOfYear = new Date(year, 0, 1).toISOString().split("T")[0];
      const endOfYear = new Date(year, 11, 31).toISOString().split("T")[0];
      query = query
        .gte("week_start_date", startOfYear)
        .lte("week_end_date", endOfYear);
    }

    // Apply month filter if provided
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1)
        .toISOString()
        .split("T")[0];
      const endOfMonth = new Date(year, month, 0).toISOString().split("T")[0];
      query = query
        .gte("week_start_date", startOfMonth)
        .lte("week_end_date", endOfMonth);
    }

    const { data, error } = await query.order("week_start_date", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching weekly reports:", error);
      throw error;
    }

    return data || [];
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
};
