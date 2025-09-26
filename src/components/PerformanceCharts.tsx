import {
  Box,
  Card,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyticsService } from "../services/analyticsService";

interface ChartData {
  week: string;
  earnings: number;
  mileage: number;
  expenses: number;
  netEarnings: number;
}

interface PerformanceChartsProps {
  userId: string;
  userType: "driver" | "owner";
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  userId,
  userType,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChartData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get the last 12 weeks of data for charts
      const data = await analyticsService.getChartData(userId, userType, 12);
      setChartData(data);
    } catch (error) {
      console.error("Error loading chart data:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 4, height: 400 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography>Loading chart data...</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 4, height: 400 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography>Loading chart data...</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  if (chartData.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Performance Charts
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          No data available for performance charts. Start creating weekly
          reports to see your performance trends.
        </Typography>
      </Paper>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, boxShadow: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Week of {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name.includes("Earnings") ||
              entry.name.includes("Expenses")
                ? " XAF"
                : ""}
              {entry.name.includes("Mileage") ? " km" : ""}
            </Typography>
          ))}
        </Card>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      {/* Earnings Trend Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper elevation={3} sx={{ p: 4, height: 400 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            {userType === "driver"
              ? "Weekly Earnings Trend"
              : "Weekly Revenue Trend"}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="week"
                stroke="#666"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: "#666" }}
              />
              <YAxis
                stroke="#666"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: "#666" }}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Mileage Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper elevation={3} sx={{ p: 4, height: 400 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            Weekly Mileage
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="week"
                stroke="#666"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: "#666" }}
              />
              <YAxis
                stroke="#666"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: "#666" }}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="mileage"
                fill={theme.palette.success.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Net Earnings vs Expenses */}
      <Grid size={{ xs: 12 }}>
        <Paper elevation={3} sx={{ p: 4, height: 400 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            Net Earnings vs Expenses
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="week"
                stroke="#666"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: "#666" }}
              />
              <YAxis
                stroke="#666"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: "#666" }}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="netEarnings"
                stroke={theme.palette.success.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
                name="Net Earnings"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={theme.palette.error.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.error.main, strokeWidth: 2, r: 4 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PerformanceCharts;
