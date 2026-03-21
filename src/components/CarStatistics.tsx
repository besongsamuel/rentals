import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { weeklyReportService } from "../services/weeklyReportService";

interface CarStatisticsProps {
  carId: string;
  statisticsRefreshKey?: number;
}

interface CarStats {
  totalReports: number;
  averageWeeklyMileage: number;
  totalMileage: number;
  averageWeeklyExpenses: number;
  totalExpenses: number;
  averageWeeklyGasExpenses: number;
  totalGasExpenses: number;
  averageWeeklyRideShareIncome: number;
  totalRideShareIncome: number;
  averageWeeklyRentalIncome: number;
  totalRentalIncome: number;
  averageWeeklyTaxiIncome: number;
  totalTaxiIncome: number;
  averageWeeklyDriverEarnings: number;
  totalDriverEarnings: number;
  averageWeeklyCarLevelExpenses: number;
  totalCarLevelExpenses: number;
  averageWeeklyProfit: number;
  totalProfit: number;
  currency: string;
}

const StatisticsSkeleton: React.FC = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Skeleton variant="text" width={160} height={32} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={72}
              height={32}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>
      </Box>
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                sx={{ mx: "auto" }}
              />
              <Skeleton variant="text" width="80%" sx={{ mx: "auto" }} />
              <Skeleton variant="text" width="70%" sx={{ mx: "auto" }} />
            </Box>
          </Grid>
        ))}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const CarStatistics: React.FC<CarStatisticsProps> = ({
  carId,
  statisticsRefreshKey = 0,
}) => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<CarStats | null>(null);
  const [loading, setLoading] = useState(true);

  const getDefaultTimeframe = () => {
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth > 3 ? "ytd" : "6_months";
  };

  const [timeframe, setTimeframe] = useState<
    "ytd" | "3_months" | "6_months" | "12_months" | "custom"
  >(getDefaultTimeframe());
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const getDateRange = useCallback((): { startDate?: Date; endDate?: Date } => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (timeframe) {
      case "ytd":
        return {
          startDate: new Date(currentYear, 0, 1),
          endDate: today,
        };

      case "3_months":
        return {
          startDate: new Date(currentYear, currentMonth - 3, 1),
          endDate: today,
        };

      case "6_months":
        return {
          startDate: new Date(currentYear, currentMonth - 6, 1),
          endDate: today,
        };

      case "12_months":
        return {
          startDate: new Date(currentYear, currentMonth - 12, 1),
          endDate: today,
        };

      case "custom":
        return {
          startDate: customStartDate ? new Date(customStartDate) : undefined,
          endDate: customEndDate ? new Date(customEndDate) : undefined,
        };

      default:
        return {};
    }
  }, [timeframe, customStartDate, customEndDate]);

  const loadStatistics = useCallback(async () => {
    if (!carId) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const stats = await weeklyReportService.getCarStatistics(
        carId,
        startDate,
        endDate
      );
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading car statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [carId, getDateRange]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics, statisticsRefreshKey]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: statistics?.currency || "XAF",
    }).format(amount);
  };

  const formatMileage = (mileage: number) => {
    return `${mileage.toFixed(0)} KM`;
  };

  if (loading) {
    return <StatisticsSkeleton />;
  }

  if (!statistics) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" component="h2">
            {t("statistics.title")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Chip
              label="YTD"
              onClick={() => setTimeframe("ytd")}
              color={timeframe === "ytd" ? "primary" : "default"}
              variant={timeframe === "ytd" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="3 Months"
              onClick={() => setTimeframe("3_months")}
              color={timeframe === "3_months" ? "primary" : "default"}
              variant={timeframe === "3_months" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="6 Months"
              onClick={() => setTimeframe("6_months")}
              color={timeframe === "6_months" ? "primary" : "default"}
              variant={timeframe === "6_months" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="12 Months"
              onClick={() => setTimeframe("12_months")}
              color={timeframe === "12_months" ? "primary" : "default"}
              variant={timeframe === "12_months" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="Custom"
              onClick={() => setTimeframe("custom")}
              color={timeframe === "custom" ? "primary" : "default"}
              variant={timeframe === "custom" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
          </Box>
        </Box>

        {timeframe === "custom" && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {formatMileage(statistics.averageWeeklyMileage)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("statistics.averageWeeklyMileage")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("statistics.totalMileage")}:{" "}
                {formatMileage(statistics.totalMileage)}
              </Typography>
              <Chip
                label={`${statistics.totalReports} ${t("statistics.reports")}`}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="error.main" gutterBottom>
                {formatCurrency(statistics.averageWeeklyExpenses)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("statistics.averageWeeklyExpenses")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("statistics.totalExpenses")}:{" "}
                {formatCurrency(statistics.totalExpenses)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {formatCurrency(statistics.averageWeeklyGasExpenses)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("statistics.averageWeeklyGasExpenses")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("statistics.totalGasExpenses")}:{" "}
                {formatCurrency(statistics.totalGasExpenses)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="secondary.main" gutterBottom>
                {formatCurrency(statistics.averageWeeklyCarLevelExpenses)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("statistics.averageWeeklyCarLevelExpenses")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("statistics.totalCarLevelExpenses")}:{" "}
                {formatCurrency(statistics.totalCarLevelExpenses)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {formatCurrency(
                  statistics.averageWeeklyRideShareIncome +
                    statistics.averageWeeklyRentalIncome +
                    statistics.averageWeeklyTaxiIncome
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("statistics.averageWeeklyIncome")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {t("statistics.rideShare")}:{" "}
                {formatCurrency(statistics.averageWeeklyRideShareIncome)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {t("statistics.rental")}:{" "}
                {formatCurrency(statistics.averageWeeklyRentalIncome)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {t("statistics.taxi")}:{" "}
                {formatCurrency(statistics.averageWeeklyTaxiIncome)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography
                    variant="h5"
                    color={
                      statistics.averageWeeklyProfit >= 0
                        ? "success.main"
                        : "error.main"
                    }
                    gutterBottom
                  >
                    {formatCurrency(statistics.averageWeeklyProfit)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("statistics.averageWeeklyProfit")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {t("statistics.totalProfit")}:{" "}
                    {formatCurrency(statistics.totalProfit)}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h5" color="info.main" gutterBottom>
                    {formatCurrency(statistics.averageWeeklyDriverEarnings)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("statistics.averageWeeklyDriverEarnings")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {t("statistics.totalDriverEarnings")}:{" "}
                    {formatCurrency(statistics.totalDriverEarnings)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CarStatistics;
