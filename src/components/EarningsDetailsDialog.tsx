import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { WeeklyReport } from "../types";

interface EarningsDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  weeklyReport: WeeklyReport | null;
}

const EarningsDetailsDialog: React.FC<EarningsDetailsDialogProps> = ({
  open,
  onClose,
  weeklyReport,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  if (!weeklyReport) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: weeklyReport.currency || "XAF",
    }).format(amount);
  };

  const totalIncome =
    (weeklyReport.ride_share_income || 0) +
    (weeklyReport.rental_income || 0) +
    (weeklyReport.taxi_income || 0);
  const totalExpenses =
    (weeklyReport.maintenance_expenses || 0) + (weeklyReport.gas_expense || 0);
  const netEarnings = totalIncome - totalExpenses;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby="earnings-details-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: "#ffffff",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        id="earnings-details-dialog-title"
        sx={{
          color: "text.primary",
          fontWeight: 600,
          textAlign: "center",
          pt: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Earnings Details - Week of {weeklyReport.week_start_date}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Income Section */}
            <Grid size={12}>
              <Box
                sx={{
                  p: 3,
                  background: "rgba(76, 175, 80, 0.02)",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Income
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={4}>
                    <Typography variant="body2" color="text.secondary">
                      Ride Share Income
                    </Typography>
                    <Typography
                      variant="h6"
                      color="success.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(weeklyReport.ride_share_income || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="body2" color="text.secondary">
                      Rental Income
                    </Typography>
                    <Typography
                      variant="h6"
                      color="success.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(weeklyReport.rental_income || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="body2" color="text.secondary">
                      Taxi Income
                    </Typography>
                    <Typography
                      variant="h6"
                      color="success.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(weeklyReport.taxi_income || 0)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    background: "rgba(76, 175, 80, 0.05)",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    color="text.primary"
                  >
                    Total Income
                  </Typography>
                  <Typography
                    variant="h6"
                    color="success.main"
                    fontWeight="600"
                  >
                    {formatCurrency(totalIncome)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Expenses Section */}
            <Grid size={12}>
              <Box
                sx={{
                  p: 3,
                  background: "rgba(244, 67, 54, 0.02)",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Expenses
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Maintenance Expenses
                    </Typography>
                    <Typography
                      variant="h6"
                      color="error.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(weeklyReport.maintenance_expenses || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Gas Expenses
                    </Typography>
                    <Typography
                      variant="h6"
                      color="error.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(weeklyReport.gas_expense || 0)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    background: "rgba(244, 67, 54, 0.05)",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    color="text.primary"
                  >
                    Total Expenses
                  </Typography>
                  <Typography variant="h6" color="error.main" fontWeight="600">
                    {formatCurrency(totalExpenses)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Driver Earnings Section */}
            <Grid size={12}>
              <Box
                sx={{
                  p: 3,
                  background: "rgba(41, 182, 246, 0.02)",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Driver Earnings
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    background: "rgba(41, 182, 246, 0.05)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Driver's Share
                  </Typography>
                  <Typography variant="h6" color="info.main" fontWeight="600">
                    {formatCurrency(weeklyReport.driver_earnings || 0)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Summary Section */}
            <Grid size={12}>
              <Box
                sx={{
                  p: 3,
                  background: "rgba(255, 167, 38, 0.02)",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Income
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="success.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(totalIncome)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="error.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(totalExpenses)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Driver Earnings
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="info.main"
                      sx={{ fontWeight: 500 }}
                    >
                      {formatCurrency(weeklyReport.driver_earnings || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Net Profit
                    </Typography>
                    <Typography
                      variant="h6"
                      color={netEarnings >= 0 ? "success.main" : "error.main"}
                      fontWeight="600"
                    >
                      {formatCurrency(netEarnings)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Additional Info */}
            <Grid size={12}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Report Status: <strong>{weeklyReport.status}</strong>
              </Typography>
              {weeklyReport.submitted_at && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  Submitted:{" "}
                  {new Date(weeklyReport.submitted_at).toLocaleDateString()}
                </Typography>
              )}
              {weeklyReport.approved_at && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  Approved:{" "}
                  {new Date(weeklyReport.approved_at).toLocaleDateString()}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EarningsDetailsDialog;
