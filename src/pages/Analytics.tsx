import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DateRangePicker, { DateRange } from "../components/DateRangePicker";
import PerformanceCharts from "../components/PerformanceCharts";
import PerformanceComparison from "../components/PerformanceComparison";
import ReportExporter from "../components/ReportExporter";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { analyticsService } from "../services/analyticsService";
import { AnalyticsData, ChartData, PerformanceMetrics } from "../types";

const Analytics: React.FC = () => {
  const { profile, loading } = useUserContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    period: "last_30_days",
  });
  const [loadingData, setLoadingData] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    if (!profile?.id) return;

    setLoadingData(true);
    try {
      const [analytics, metrics, charts] = await Promise.all([
        analyticsService.getAnalyticsData(profile.id, profile.user_type),
        analyticsService.getPerformanceMetrics(profile.id, profile.user_type),
        analyticsService.getChartData(profile.id, profile.user_type, 12),
      ]);

      setAnalyticsData(analytics);
      setPerformanceMetrics(metrics);
      setChartData(charts);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoadingData(false);
    }
  }, [profile?.id, profile?.user_type]);

  useEffect(() => {
    if (profile?.id) {
      loadAnalyticsData();
    }
  }, [profile?.id, loadAnalyticsData]);

  if (loading || loadingData) {
    return <SkeletonLoader variant="dashboard" />;
  }

  if (!profile) {
    return <SkeletonLoader variant="dashboard" />;
  }

  const isDriver = profile.user_type === "driver";
  const isOwner = profile.user_type === "owner";

  return (
    <Box sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 400,
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: "#1D1D1F",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {isDriver ? "Driver Analytics" : "Owner Analytics"}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            color: "#86868B",
            fontSize: { xs: "1rem", sm: "1.125rem" },
            letterSpacing: "-0.01em",
          }}
        >
          {isDriver
            ? "Track your performance, earnings, and driving efficiency"
            : "Monitor your fleet performance, profitability, and driver metrics"}
        </Typography>
      </Box>

      {/* Date Range Picker and Export */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: { xs: "stretch", sm: "flex-end" },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            disabled={loadingData}
          />
        </Box>
        <Box sx={{ minWidth: { xs: "100%", sm: "auto" } }}>
          {analyticsData && performanceMetrics && (
            <ReportExporter
              analyticsData={analyticsData}
              performanceMetrics={performanceMetrics}
              chartData={chartData}
              userType={profile.user_type}
              dateRange={dateRange}
            />
          )}
        </Box>
      </Box>

      {/* Performance Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {analyticsData && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 1,
                    }}
                  >
                    {isDriver
                      ? `$${analyticsData.totalEarnings.toLocaleString()}`
                      : `$${analyticsData.totalRevenue.toLocaleString()}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isDriver ? "Total Earnings" : "Total Revenue"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: "success.main",
                      mb: 1,
                    }}
                  >
                    {analyticsData.totalMileage.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Mileage
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: "info.main",
                      mb: 1,
                    }}
                  >
                    {analyticsData.totalReports}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reports
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: "warning.main",
                      mb: 1,
                    }}
                  >
                    {isDriver
                      ? analyticsData.assignedCars
                      : analyticsData.totalCars}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isDriver ? "Assigned Cars" : "Total Cars"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 4, height: "100%" }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                Performance Metrics
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Average Weekly Earnings
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${performanceMetrics.averageWeeklyEarnings.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Average Mileage per Week
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {performanceMetrics.averageWeeklyMileage.toLocaleString()} km
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Earnings per Mile
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${performanceMetrics.earningsPerMile.toFixed(2)}
                </Typography>
              </Box>

              {isOwner && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Average Car Utilization
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {performanceMetrics.carUtilization.toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 4, height: "100%" }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
                Recent Trends
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Last 30 Days Earnings
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${performanceMetrics.last30DaysEarnings.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Last 30 Days Mileage
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {performanceMetrics.last30DaysMileage.toLocaleString()} km
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Report Submission Rate
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {performanceMetrics.reportSubmissionRate.toFixed(1)}%
                </Typography>
              </Box>

              {isOwner && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Active Drivers
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {performanceMetrics.activeDrivers}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Performance Charts */}
      {profile && (
        <Box sx={{ mt: 4 }}>
          <PerformanceCharts userId={profile.id} userType={profile.user_type} />
        </Box>
      )}

      {/* Performance Comparison */}
      {profile && dateRange.startDate && dateRange.endDate && (
        <Box sx={{ mt: 4 }}>
          <PerformanceComparison
            userId={profile.id}
            userType={profile.user_type}
            currentDateRange={dateRange}
          />
        </Box>
      )}
    </Box>
  );
};

export default Analytics;
