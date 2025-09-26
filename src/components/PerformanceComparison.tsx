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
import { analyticsService } from "../services/analyticsService";

interface ComparisonMetrics {
  currentPeriod: {
    totalEarnings: number;
    totalMileage: number;
    averageWeeklyEarnings: number;
    reportSubmissionRate: number;
  };
  previousPeriod: {
    totalEarnings: number;
    totalMileage: number;
    averageWeeklyEarnings: number;
    reportSubmissionRate: number;
  };
  changes: {
    earningsChange: number;
    mileageChange: number;
    weeklyEarningsChange: number;
    submissionRateChange: number;
  };
}

interface PerformanceComparisonProps {
  userId: string;
  userType: "driver" | "owner";
  currentDateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({
  userId,
  userType,
  currentDateRange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [comparisonData, setComparisonData] =
    useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadComparisonData = useCallback(async () => {
    if (!userId || !currentDateRange.startDate || !currentDateRange.endDate) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Calculate previous period dates
      const currentDuration =
        currentDateRange.endDate.getTime() -
        currentDateRange.startDate.getTime();
      const previousEndDate = new Date(
        currentDateRange.startDate.getTime() - 1
      );
      const previousStartDate = new Date(
        previousEndDate.getTime() - currentDuration
      );

      // Get data for both periods
      const [currentAnalytics, currentMetrics, previousData] =
        await Promise.all([
          analyticsService.getAnalyticsData(userId, userType),
          analyticsService.getPerformanceMetrics(userId, userType),
          analyticsService.getAnalyticsDataForPeriod(
            userId,
            userType,
            previousStartDate,
            previousEndDate
          ),
        ]);

      const currentData = { ...currentAnalytics, ...currentMetrics };

      // Calculate changes
      const changes = {
        earningsChange: calculatePercentageChange(
          previousData.totalEarnings,
          currentData.totalEarnings
        ),
        mileageChange: calculatePercentageChange(
          previousData.totalMileage,
          currentData.totalMileage
        ),
        weeklyEarningsChange: calculatePercentageChange(
          previousData.averageWeeklyEarnings,
          currentData.averageWeeklyEarnings
        ),
        submissionRateChange: calculatePercentageChange(
          previousData.reportSubmissionRate,
          currentData.reportSubmissionRate
        ),
      };

      setComparisonData({
        currentPeriod: {
          totalEarnings: currentData.totalEarnings,
          totalMileage: currentData.totalMileage,
          averageWeeklyEarnings: currentData.averageWeeklyEarnings,
          reportSubmissionRate: currentData.reportSubmissionRate,
        },
        previousPeriod: {
          totalEarnings: previousData.totalEarnings,
          totalMileage: previousData.totalMileage,
          averageWeeklyEarnings: previousData.averageWeeklyEarnings,
          reportSubmissionRate: previousData.reportSubmissionRate,
        },
        changes,
      });
    } catch (error) {
      console.error("Error loading comparison data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, userType, currentDateRange]);

  useEffect(() => {
    loadComparisonData();
  }, [loadComparisonData]);

  const calculatePercentageChange = (
    oldValue: number,
    newValue: number
  ): number => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return "↗";
    if (change < 0) return "↘";
    return "→";
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
          Performance Comparison
        </Typography>
        <Typography>Loading comparison data...</Typography>
      </Paper>
    );
  }

  if (!comparisonData) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
          Performance Comparison
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No comparison data available. Select a date range to compare
          performance.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        Performance Comparison
      </Typography>

      <Grid container spacing={3}>
        {/* Total Earnings Comparison */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Total {userType === "driver" ? "Earnings" : "Revenue"}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {comparisonData.currentPeriod.totalEarnings.toLocaleString()}{" "}
                XAF
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: getChangeColor(
                      comparisonData.changes.earningsChange
                    ),
                  }}
                >
                  {getChangeIcon(comparisonData.changes.earningsChange)}{" "}
                  {formatChange(comparisonData.changes.earningsChange)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Mileage Comparison */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Total Mileage
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {comparisonData.currentPeriod.totalMileage.toLocaleString()} km
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: getChangeColor(comparisonData.changes.mileageChange),
                  }}
                >
                  {getChangeIcon(comparisonData.changes.mileageChange)}{" "}
                  {formatChange(comparisonData.changes.mileageChange)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Weekly Earnings Comparison */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Avg Weekly {userType === "driver" ? "Earnings" : "Revenue"}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {comparisonData.currentPeriod.averageWeeklyEarnings.toLocaleString()}{" "}
                XAF
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: getChangeColor(
                      comparisonData.changes.weeklyEarningsChange
                    ),
                  }}
                >
                  {getChangeIcon(comparisonData.changes.weeklyEarningsChange)}{" "}
                  {formatChange(comparisonData.changes.weeklyEarningsChange)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Submission Rate Comparison */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Report Submission Rate
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {comparisonData.currentPeriod.reportSubmissionRate.toFixed(1)}%
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: getChangeColor(
                      comparisonData.changes.submissionRateChange
                    ),
                  }}
                >
                  {getChangeIcon(comparisonData.changes.submissionRateChange)}{" "}
                  {formatChange(comparisonData.changes.submissionRateChange)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PerformanceComparison;
