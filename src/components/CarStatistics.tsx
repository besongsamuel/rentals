import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { weeklyReportService } from "../services/weeklyReportService";

interface CarStatisticsProps {
  carId: string;
}

interface CarStats {
  totalReports: number;
  averageWeeklyMileage: number;
  totalMileage: number;
  averageWeeklyExpenses: number;
  totalExpenses: number;
  averageWeeklyRideShareIncome: number;
  totalRideShareIncome: number;
  averageWeeklyRentalIncome: number;
  totalRentalIncome: number;
  averageWeeklyDriverEarnings: number;
  totalDriverEarnings: number;
  averageWeeklyProfit: number;
  totalProfit: number;
  currency: string;
}

const CarStatistics: React.FC<CarStatisticsProps> = ({ carId }) => {
  const [statistics, setStatistics] = useState<CarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"monthly" | "yearly" | "all">(
    "all"
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );

  const loadStatistics = useCallback(async () => {
    if (!carId) return;

    setLoading(true);
    try {
      const stats = await weeklyReportService.getCarStatistics(
        carId,
        timeframe,
        timeframe !== "all" ? selectedYear : undefined,
        timeframe === "monthly" ? selectedMonth : undefined
      );
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading car statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [carId, timeframe, selectedYear, selectedMonth]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

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
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
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
            Car Statistics
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={(e) =>
                  setTimeframe(e.target.value as "monthly" | "yearly" | "all")
                }
                label="Timeframe"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>

            {timeframe !== "all" && (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  label="Year"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {timeframe === "monthly" && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  label="Month"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <MenuItem key={month} value={month}>
                      {new Date(selectedYear, month - 1).toLocaleDateString(
                        "en-US",
                        { month: "long" }
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Usage Statistics */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {formatMileage(statistics.averageWeeklyMileage)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Weekly Usage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {formatMileage(statistics.totalMileage)}
              </Typography>
              <Chip
                label={`${statistics.totalReports} reports`}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          {/* Expenses */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="error.main" gutterBottom>
                {formatCurrency(statistics.averageWeeklyExpenses)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Weekly Expenses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {formatCurrency(statistics.totalExpenses)}
              </Typography>
            </Box>
          </Grid>

          {/* Income Breakdown */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {formatCurrency(
                  statistics.averageWeeklyRideShareIncome +
                    statistics.averageWeeklyRentalIncome
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Weekly Income
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                Ride Share:{" "}
                {formatCurrency(statistics.averageWeeklyRideShareIncome)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                Rental: {formatCurrency(statistics.averageWeeklyRentalIncome)}
              </Typography>
            </Box>
          </Grid>

          {/* Profit & Driver Earnings */}
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
                    Avg Weekly Profit
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    Total: {formatCurrency(statistics.totalProfit)}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h5" color="info.main" gutterBottom>
                    {formatCurrency(statistics.averageWeeklyDriverEarnings)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Weekly Driver Earnings
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    Total: {formatCurrency(statistics.totalDriverEarnings)}
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
