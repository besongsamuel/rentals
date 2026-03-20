import { Edit } from "@mui/icons-material";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Car } from "../../types";

interface ReportSummaryStepProps {
  car: Car | null;
  weekStartDate: string;
  weekEndDate: string;
  startMileage: number;
  endMileage: number;
  maintenanceExpenses: number;
  gasExpense: number;
  rideShareIncome: number;
  rentalIncome: number;
  taxiIncome: number;
  driverEarnings: number;
  currency: string;
  onEditStep: (stepIndex: number) => void;
}

const toAmount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const n = parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : 0;
};

const ReportSummaryStep: React.FC<ReportSummaryStepProps> = ({
  car,
  weekStartDate,
  weekEndDate,
  startMileage,
  endMileage,
  maintenanceExpenses,
  gasExpense,
  rideShareIncome,
  rentalIncome,
  taxiIncome,
  driverEarnings,
  currency,
  onEditStep,
}) => {
  const { t } = useTranslation();

  const totalDistance =
    endMileage > startMileage ? endMileage - startMileage : 0;
  const rs = toAmount(rideShareIncome);
  const ri = toAmount(rentalIncome);
  const ti = toAmount(taxiIncome);
  const totalRevenue = rs + ri + ti;
  const totalExpenses = toAmount(maintenanceExpenses) + toAmount(gasExpense);
  const driverPay = toAmount(driverEarnings);
  const netProfit = totalRevenue - totalExpenses - driverPay;

  const SummarySection: React.FC<{
    title: string;
    stepIndex: number;
    children: React.ReactNode;
  }> = ({ title, stepIndex, children }) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => onEditStep(stepIndex)}
          sx={{ minWidth: "auto" }}
        >
          {t("common.edit")}
        </Button>
      </Box>
      {children}
    </Box>
  );

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        {t("reports.reportSummary")}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Car Selection */}
        {car && (
          <SummarySection title={t("cars.title")} stepIndex={0}>
            <Typography variant="body1">
              {car.year} {car.make} {car.model}
              {car.license_plate && ` - ${car.license_plate}`}
            </Typography>
          </SummarySection>
        )}

        {/* Date Selection */}
        <SummarySection title={t("reports.weekPeriod")} stepIndex={1}>
          <Typography variant="body1">
            {new Date(weekStartDate).toLocaleDateString()} -{" "}
            {new Date(weekEndDate).toLocaleDateString()}
          </Typography>
        </SummarySection>

        {/* Mileage */}
        <SummarySection title={t("reports.mileage")} stepIndex={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("reports.startMileage")}
              </Typography>
              <Typography variant="body1">{startMileage} {t("common.km")}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("reports.endMileage")}
              </Typography>
              <Typography variant="body1">{endMileage} {t("common.km")}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary">
                {t("reports.totalDistance")}
              </Typography>
              <Typography variant="h6" sx={{ color: "success.main", fontWeight: 600 }}>
                {totalDistance} {t("common.km")}
              </Typography>
            </Grid>
          </Grid>
        </SummarySection>

        {/* Expenses */}
        <SummarySection title={t("reports.expenses")} stepIndex={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">{t("reports.maintenanceExpenses")}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {currency} {toAmount(maintenanceExpenses).toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">{t("reports.gasExpense")}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {currency} {toAmount(gasExpense).toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {t("reports.totalExpenses")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {currency} {totalExpenses.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </SummarySection>

        {/* Revenue */}
        <SummarySection title={t("reports.incomes")} stepIndex={5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">{t("reports.rideShareIncome")}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {currency} {rs.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">{t("reports.rentalIncome")}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {currency} {ri.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">{t("reports.taxiIncome")}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {currency} {ti.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {t("reports.totalRevenue")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "success.main" }}>
                {currency} {totalRevenue.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </SummarySection>

        {/* Driver Earnings */}
        <SummarySection title={t("reports.driverEarnings")} stepIndex={6}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {currency} {driverPay.toFixed(2)}
          </Typography>
        </SummarySection>

        {/* Net Profit */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: netProfit >= 0 ? "rgba(5, 150, 105, 0.1)" : "rgba(211, 47, 47, 0.1)",
            border: "2px solid",
            borderColor: netProfit >= 0 ? "success.main" : "error.main",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t("reports.netProfit")}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: netProfit >= 0 ? "success.main" : "error.main",
            }}
          >
            {currency} {netProfit.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {t("reports.summaryNetProfitFormula", {
              rev: `${currency} ${totalRevenue.toFixed(2)}`,
              exp: `${currency} ${totalExpenses.toFixed(2)}`,
              drv: `${currency} ${driverPay.toFixed(2)}`,
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportSummaryStep;
