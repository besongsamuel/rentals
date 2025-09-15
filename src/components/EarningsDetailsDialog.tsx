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
    (weeklyReport.ride_share_income || 0) + (weeklyReport.rental_income || 0);
  const netEarnings = totalIncome - (weeklyReport.maintenance_expenses || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby="earnings-details-dialog-title"
    >
      <DialogTitle id="earnings-details-dialog-title">
        Earnings Details - Week of {weeklyReport.week_start_date}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Income Section */}
            <Grid size={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Income
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ride Share Income
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(weeklyReport.ride_share_income || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Rental Income
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(weeklyReport.rental_income || 0)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total Income
                  </Typography>
                  <Typography
                    variant="h6"
                    color="success.main"
                    fontWeight="bold"
                  >
                    {formatCurrency(totalIncome)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Expenses Section */}
            <Grid size={12}>
              <Typography variant="h6" color="error" gutterBottom>
                Expenses
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Maintenance Expenses
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(weeklyReport.maintenance_expenses || 0)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Driver Earnings Section */}
            <Grid size={12}>
              <Typography variant="h6" color="info.main" gutterBottom>
                Driver Earnings
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Driver's Share
                  </Typography>
                  <Typography variant="h6" color="info.main" fontWeight="bold">
                    {formatCurrency(weeklyReport.driver_earnings || 0)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Summary Section */}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Income
                    </Typography>
                    <Typography variant="subtitle1" color="success.main">
                      {formatCurrency(totalIncome)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                    <Typography variant="subtitle1" color="error.main">
                      {formatCurrency(weeklyReport.maintenance_expenses || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Driver Earnings
                    </Typography>
                    <Typography variant="subtitle1" color="info.main">
                      {formatCurrency(weeklyReport.driver_earnings || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Net Profit
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color={netEarnings >= 0 ? "success.main" : "error.main"}
                      fontWeight="bold"
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
