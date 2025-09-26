import { supabase } from "../lib/supabase";
import { AnalyticsData, ChartData, PerformanceMetrics } from "../types";

export const analyticsService = {
  async getAnalyticsData(
    userId: string,
    userType: "driver" | "owner"
  ): Promise<AnalyticsData> {
    try {
      if (userType === "driver") {
        return await this.getDriverAnalytics(userId);
      } else {
        return await this.getOwnerAnalytics(userId);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      throw error;
    }
  },

  async getDriverAnalytics(driverId: string): Promise<AnalyticsData> {
    // Get driver's assigned cars
    const { data: assignedCars, error: carsError } = await supabase
      .from("cars")
      .select("id")
      .eq("driver_id", driverId);

    if (carsError) throw carsError;

    const carIds = assignedCars?.map((car) => car.id) || [];

    if (carIds.length === 0) {
      return {
        totalEarnings: 0,
        totalRevenue: 0,
        totalMileage: 0,
        totalReports: 0,
        assignedCars: 0,
        totalCars: 0,
      };
    }

    // Get weekly reports for assigned cars
    const { data: reports, error: reportsError } = await supabase
      .from("weekly_reports")
      .select("driver_earnings, start_mileage, end_mileage")
      .in("car_id", carIds)
      .eq("driver_id", driverId);

    if (reportsError) throw reportsError;

    const totalEarnings =
      reports?.reduce(
        (sum, report) => sum + (report.driver_earnings || 0),
        0
      ) || 0;
    const totalMileage =
      reports?.reduce(
        (sum, report) => sum + (report.end_mileage - report.start_mileage),
        0
      ) || 0;
    const totalReports = reports?.length || 0;

    return {
      totalEarnings,
      totalRevenue: totalEarnings, // For drivers, revenue = earnings
      totalMileage,
      totalReports,
      assignedCars: carIds.length,
      totalCars: carIds.length,
    };
  },

  async getOwnerAnalytics(ownerId: string): Promise<AnalyticsData> {
    // Get owner's cars (main owner and additional owner)
    const { data: mainOwnerCars, error: mainCarsError } = await supabase
      .from("cars")
      .select("id")
      .eq("owner_id", ownerId);

    if (mainCarsError) throw mainCarsError;

    const { data: additionalOwnerCars, error: additionalCarsError } =
      await supabase
        .from("car_owners")
        .select("car_id")
        .eq("owner_id", ownerId);

    if (additionalCarsError) throw additionalCarsError;

    const mainCarIds = mainOwnerCars?.map((car) => car.id) || [];
    const additionalCarIds =
      additionalOwnerCars?.map((car) => car.car_id) || [];
    const allCarIds = Array.from(new Set([...mainCarIds, ...additionalCarIds]));

    if (allCarIds.length === 0) {
      return {
        totalEarnings: 0,
        totalRevenue: 0,
        totalMileage: 0,
        totalReports: 0,
        assignedCars: 0,
        totalCars: 0,
      };
    }

    // Get weekly reports for all owned cars
    const { data: reports, error: reportsError } = await supabase
      .from("weekly_reports")
      .select(
        "driver_earnings, ride_share_income, rental_income, start_mileage, end_mileage"
      )
      .in("car_id", allCarIds);

    if (reportsError) throw reportsError;

    const totalRevenue =
      reports?.reduce(
        (sum, report) =>
          sum + (report.ride_share_income || 0) + (report.rental_income || 0),
        0
      ) || 0;
    const totalEarnings =
      reports?.reduce(
        (sum, report) => sum + (report.driver_earnings || 0),
        0
      ) || 0;
    const totalMileage =
      reports?.reduce(
        (sum, report) => sum + (report.end_mileage - report.start_mileage),
        0
      ) || 0;
    const totalReports = reports?.length || 0;

    return {
      totalEarnings,
      totalRevenue,
      totalMileage,
      totalReports,
      assignedCars: allCarIds.length,
      totalCars: allCarIds.length,
    };
  },

  async getPerformanceMetrics(
    userId: string,
    userType: "driver" | "owner"
  ): Promise<PerformanceMetrics> {
    try {
      if (userType === "driver") {
        return await this.getDriverPerformanceMetrics(userId);
      } else {
        return await this.getOwnerPerformanceMetrics(userId);
      }
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      throw error;
    }
  },

  async getDriverPerformanceMetrics(
    driverId: string
  ): Promise<PerformanceMetrics> {
    // Get driver's assigned cars
    const { data: assignedCars, error: carsError } = await supabase
      .from("cars")
      .select("id")
      .eq("driver_id", driverId);

    if (carsError) throw carsError;

    const carIds = assignedCars?.map((car) => car.id) || [];

    if (carIds.length === 0) {
      return {
        averageWeeklyEarnings: 0,
        averageWeeklyMileage: 0,
        earningsPerMile: 0,
        carUtilization: 0,
        last30DaysEarnings: 0,
        last30DaysMileage: 0,
        reportSubmissionRate: 0,
        activeDrivers: 0,
      };
    }

    // Get all reports for the driver
    const { data: allReports, error: allReportsError } = await supabase
      .from("weekly_reports")
      .select(
        "driver_earnings, start_mileage, end_mileage, week_start_date, status"
      )
      .in("car_id", carIds)
      .eq("driver_id", driverId)
      .order("week_start_date", { ascending: false });

    if (allReportsError) throw allReportsError;

    // Get reports from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysReports =
      allReports?.filter(
        (report) => new Date(report.week_start_date) >= thirtyDaysAgo
      ) || [];

    // Calculate metrics
    const totalEarnings =
      allReports?.reduce(
        (sum, report) => sum + (report.driver_earnings || 0),
        0
      ) || 0;
    const totalMileage =
      allReports?.reduce(
        (sum, report) => sum + (report.end_mileage - report.start_mileage),
        0
      ) || 0;
    const totalWeeks = allReports?.length || 1;

    const last30DaysEarnings = last30DaysReports.reduce(
      (sum, report) => sum + (report.driver_earnings || 0),
      0
    );
    const last30DaysMileage = last30DaysReports.reduce(
      (sum, report) => sum + (report.end_mileage - report.start_mileage),
      0
    );

    const submittedReports =
      allReports?.filter(
        (report) =>
          report.status === "submitted" || report.status === "approved"
      ).length || 0;
    const reportSubmissionRate =
      totalWeeks > 0 ? (submittedReports / totalWeeks) * 100 : 0;

    return {
      averageWeeklyEarnings: totalWeeks > 0 ? totalEarnings / totalWeeks : 0,
      averageWeeklyMileage: totalWeeks > 0 ? totalMileage / totalWeeks : 0,
      earningsPerMile: totalMileage > 0 ? totalEarnings / totalMileage : 0,
      carUtilization: 0, // Not applicable for drivers
      last30DaysEarnings,
      last30DaysMileage,
      reportSubmissionRate,
      activeDrivers: 0, // Not applicable for drivers
    };
  },

  async getOwnerPerformanceMetrics(
    ownerId: string
  ): Promise<PerformanceMetrics> {
    // Get owner's cars (main owner and additional owner)
    const { data: mainOwnerCars, error: mainCarsError } = await supabase
      .from("cars")
      .select("id")
      .eq("owner_id", ownerId);

    if (mainCarsError) throw mainCarsError;

    const { data: additionalOwnerCars, error: additionalCarsError } =
      await supabase
        .from("car_owners")
        .select("car_id")
        .eq("owner_id", ownerId);

    if (additionalCarsError) throw additionalCarsError;

    const mainCarIds = mainOwnerCars?.map((car) => car.id) || [];
    const additionalCarIds =
      additionalOwnerCars?.map((car) => car.car_id) || [];
    const allCarIds = Array.from(new Set([...mainCarIds, ...additionalCarIds]));

    if (allCarIds.length === 0) {
      return {
        averageWeeklyEarnings: 0,
        averageWeeklyMileage: 0,
        earningsPerMile: 0,
        carUtilization: 0,
        last30DaysEarnings: 0,
        last30DaysMileage: 0,
        reportSubmissionRate: 0,
        activeDrivers: 0,
      };
    }

    // Get all reports for owned cars
    const { data: allReports, error: allReportsError } = await supabase
      .from("weekly_reports")
      .select(
        "car_id, driver_id, driver_earnings, ride_share_income, rental_income, start_mileage, end_mileage, week_start_date, status"
      )
      .in("car_id", allCarIds)
      .order("week_start_date", { ascending: false });

    if (allReportsError) throw allReportsError;

    // Get reports from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysReports =
      allReports?.filter(
        (report) => new Date(report.week_start_date) >= thirtyDaysAgo
      ) || [];

    // Calculate metrics
    const totalRevenue =
      allReports?.reduce(
        (sum, report) =>
          sum + (report.ride_share_income || 0) + (report.rental_income || 0),
        0
      ) || 0;
    const totalMileage =
      allReports?.reduce(
        (sum, report) => sum + (report.end_mileage - report.start_mileage),
        0
      ) || 0;
    const totalWeeks = allReports?.length || 1;

    const last30DaysEarnings = last30DaysReports.reduce(
      (sum, report) =>
        sum + (report.ride_share_income || 0) + (report.rental_income || 0),
      0
    );
    const last30DaysMileage = last30DaysReports.reduce(
      (sum, report) => sum + (report.end_mileage - report.start_mileage),
      0
    );

    const submittedReports =
      allReports?.filter(
        (report) =>
          report.status === "submitted" || report.status === "approved"
      ).length || 0;
    const reportSubmissionRate =
      totalWeeks > 0 ? (submittedReports / totalWeeks) * 100 : 0;

    // Calculate car utilization (percentage of cars with active reports in last 30 days)
    const activeCarsInLast30Days = Array.from(
      new Set(last30DaysReports.map((report) => report.car_id))
    ).length;
    const carUtilization =
      allCarIds.length > 0
        ? (activeCarsInLast30Days / allCarIds.length) * 100
        : 0;

    // Get active drivers (drivers with reports in last 30 days)
    const activeDrivers = Array.from(
      new Set(last30DaysReports.map((report) => report.driver_id))
    ).length;

    return {
      averageWeeklyEarnings: totalWeeks > 0 ? totalRevenue / totalWeeks : 0,
      averageWeeklyMileage: totalWeeks > 0 ? totalMileage / totalWeeks : 0,
      earningsPerMile: totalMileage > 0 ? totalRevenue / totalMileage : 0,
      carUtilization,
      last30DaysEarnings,
      last30DaysMileage,
      reportSubmissionRate,
      activeDrivers,
    };
  },

  async getChartData(
    userId: string,
    userType: "driver" | "owner",
    weeks: number = 12
  ): Promise<ChartData[]> {
    try {
      if (userType === "driver") {
        return await this.getDriverChartData(userId, weeks);
      } else {
        return await this.getOwnerChartData(userId, weeks);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw error;
    }
  },

  async getDriverChartData(
    driverId: string,
    weeks: number
  ): Promise<ChartData[]> {
    // Get driver's assigned cars
    const { data: assignedCars, error: carsError } = await supabase
      .from("cars")
      .select("id")
      .eq("driver_id", driverId);

    if (carsError) throw carsError;

    const carIds = assignedCars?.map((car) => car.id) || [];

    if (carIds.length === 0) {
      return [];
    }

    // Calculate date range for the last N weeks
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    // Get weekly reports for the specified period
    const { data: reports, error: reportsError } = await supabase
      .from("weekly_reports")
      .select(
        "week_start_date, driver_earnings, maintenance_expenses, gas_expense, start_mileage, end_mileage"
      )
      .in("car_id", carIds)
      .eq("driver_id", driverId)
      .gte("week_start_date", startDate.toISOString().split("T")[0])
      .lte("week_start_date", endDate.toISOString().split("T")[0])
      .order("week_start_date", { ascending: true });

    if (reportsError) throw reportsError;

    // Transform data for charts
    const chartData: ChartData[] =
      reports?.map((report) => {
        const weekDate = new Date(report.week_start_date);
        const weekLabel = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;
        const totalExpenses =
          (report.maintenance_expenses || 0) + (report.gas_expense || 0);
        const netEarnings = (report.driver_earnings || 0) - totalExpenses;

        return {
          week: weekLabel,
          earnings: report.driver_earnings || 0,
          mileage: (report.end_mileage || 0) - (report.start_mileage || 0),
          expenses: totalExpenses,
          netEarnings: netEarnings,
        };
      }) || [];

    return chartData;
  },

  async getOwnerChartData(
    ownerId: string,
    weeks: number
  ): Promise<ChartData[]> {
    // Get owner's cars (main owner and additional owner)
    const { data: mainOwnerCars, error: mainCarsError } = await supabase
      .from("cars")
      .select("id")
      .eq("owner_id", ownerId);

    if (mainCarsError) throw mainCarsError;

    const { data: additionalOwnerCars, error: additionalCarsError } =
      await supabase
        .from("car_owners")
        .select("car_id")
        .eq("owner_id", ownerId);

    if (additionalCarsError) throw additionalCarsError;

    const mainCarIds = mainOwnerCars?.map((car) => car.id) || [];
    const additionalCarIds =
      additionalOwnerCars?.map((car) => car.car_id) || [];
    const allCarIds = Array.from(new Set([...mainCarIds, ...additionalCarIds]));

    if (allCarIds.length === 0) {
      return [];
    }

    // Calculate date range for the last N weeks
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    // Get weekly reports for the specified period
    const { data: reports, error: reportsError } = await supabase
      .from("weekly_reports")
      .select(
        "week_start_date, ride_share_income, rental_income, maintenance_expenses, gas_expense, start_mileage, end_mileage"
      )
      .in("car_id", allCarIds)
      .gte("week_start_date", startDate.toISOString().split("T")[0])
      .lte("week_start_date", endDate.toISOString().split("T")[0])
      .order("week_start_date", { ascending: true });

    if (reportsError) throw reportsError;

    // Group reports by week and aggregate data
    const weeklyData: { [key: string]: ChartData } = {};

    reports?.forEach((report) => {
      const weekDate = new Date(report.week_start_date);
      const weekKey = weekDate.toISOString().split("T")[0];
      const weekLabel = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekLabel,
          earnings: 0,
          mileage: 0,
          expenses: 0,
          netEarnings: 0,
        };
      }

      // Aggregate data for the week
      weeklyData[weekKey].earnings +=
        (report.ride_share_income || 0) + (report.rental_income || 0);
      weeklyData[weekKey].mileage +=
        (report.end_mileage || 0) - (report.start_mileage || 0);
      weeklyData[weekKey].expenses +=
        (report.maintenance_expenses || 0) + (report.gas_expense || 0);
    });

    // Calculate net earnings and convert to array
    const chartData: ChartData[] = Object.values(weeklyData).map((data) => ({
      ...data,
      netEarnings: data.earnings - data.expenses,
    }));

    return chartData.sort((a, b) => {
      // Sort by week date
      const dateA = new Date(a.week);
      const dateB = new Date(b.week);
      return dateA.getTime() - dateB.getTime();
    });
  },
};
