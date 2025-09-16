import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Car, CreateWeeklyReportData, WeeklyReport } from "../types";
import ErrorAlert from "./ErrorAlert";

interface WeeklyReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reportData: CreateWeeklyReportData) => void;
  assignedCars?: Car[];
  editingReport?: WeeklyReport | null;
  mode: "add" | "edit";
}

const WeeklyReportDialog: React.FC<WeeklyReportDialogProps> = ({
  open,
  onClose,
  onSubmit,
  assignedCars = [],
  editingReport = null,
  mode,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  // Helper function to get the start of the week (Sunday)
  const getWeekStart = useCallback((date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday is 0
    return new Date(d.setDate(diff));
  }, []);

  // Helper function to get the end of the week (Saturday)
  const getWeekEnd = useCallback(
    (date: Date): Date => {
      const weekStart = getWeekStart(date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return weekEnd;
    },
    [getWeekStart]
  );

  // Helper function to format date as YYYY-MM-DD
  const formatDateForInput = useCallback((date: Date): string => {
    return date.toISOString().split("T")[0];
  }, []);

  // Helper function to get current week dates
  const getCurrentWeek = useCallback(() => {
    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = getWeekEnd(today);
    return {
      start: formatDateForInput(weekStart),
      end: formatDateForInput(weekEnd),
    };
  }, [getWeekStart, getWeekEnd, formatDateForInput]);

  // Helper function to navigate to previous/next week
  const navigateWeek = (
    currentStartDate: string,
    direction: "prev" | "next"
  ) => {
    const currentDate = new Date(currentStartDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));

    const weekStart = getWeekStart(newDate);
    const weekEnd = getWeekEnd(newDate);

    return {
      start: formatDateForInput(weekStart),
      end: formatDateForInput(weekEnd),
    };
  };

  const [formData, setFormData] = useState({
    car_id: "",
    week_start_date: "",
    week_end_date: "",
    start_mileage: 0,
    end_mileage: 0,
    driver_earnings: 0,
    maintenance_expenses: 0,
    gas_expense: 0,
    ride_share_income: 0,
    rental_income: 0,
    currency: "XAF",
  });
  const [error, setError] = useState("");

  // Initialize form data when dialog opens or editing report changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && editingReport) {
        setFormData({
          car_id: editingReport.car_id,
          week_start_date: editingReport.week_start_date,
          week_end_date: editingReport.week_end_date,
          start_mileage: editingReport.start_mileage,
          end_mileage: editingReport.end_mileage,
          driver_earnings: editingReport.driver_earnings,
          maintenance_expenses: editingReport.maintenance_expenses,
          gas_expense: editingReport.gas_expense || 0,
          ride_share_income: (editingReport as any).ride_share_income || 0,
          rental_income: (editingReport as any).rental_income || 0,
          currency: (editingReport as any).currency || "XAF",
        });
      } else {
        // Reset form for add mode with current week as default
        const currentWeek = getCurrentWeek();
        setFormData({
          car_id: assignedCars.length === 1 ? assignedCars[0].id : "",
          week_start_date: currentWeek.start,
          week_end_date: currentWeek.end,
          start_mileage: 0,
          end_mileage: 0,
          driver_earnings: 0,
          maintenance_expenses: 0,
          gas_expense: 0,
          ride_share_income: 0,
          rental_income: 0,
          currency: "XAF",
        });
      }
      setError("");
    }
  }, [open, mode, editingReport, assignedCars, getCurrentWeek]);

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]:
          field.includes("mileage") ||
          field.includes("earnings") ||
          field.includes("expenses") ||
          field.includes("income")
            ? parseFloat(value) || 0
            : value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.car_id.trim()) {
      setError(t("errors.carSelectionRequired"));
      return;
    }

    if (mode === "add") {
      // Check if selected car is assigned to driver
      if (
        assignedCars.length > 0 &&
        !assignedCars.some((car) => car.id === formData.car_id)
      ) {
        setError(t("errors.onlyAssignedCars"));
        return;
      }
    }

    if (!formData.week_start_date || !formData.week_end_date) {
      setError(t("errors.weekDatesRequired"));
      return;
    }

    if (formData.start_mileage < 0 || formData.end_mileage < 0) {
      setError(t("errors.mileageNonNegative"));
      return;
    }

    if (formData.end_mileage < formData.start_mileage) {
      setError(t("errors.endMileageGreater"));
      return;
    }

    if (formData.driver_earnings < 0) {
      setError(t("errors.earningsNonNegative"));
      return;
    }

    if (formData.maintenance_expenses < 0) {
      setError(t("errors.expensesNonNegative"));
      return;
    }

    try {
      onSubmit(formData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save report"
      );
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  // Handle week navigation
  const handleWeekNavigation = (direction: "prev" | "next") => {
    if (formData.week_start_date) {
      const newWeek = navigateWeek(formData.week_start_date, direction);
      setFormData((prev) => ({
        ...prev,
        week_start_date: newWeek.start,
        week_end_date: newWeek.end,
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      aria-labelledby="weekly-report-dialog-title"
    >
      <DialogTitle id="weekly-report-dialog-title">
        {mode === "add" ? t("reports.addReport") : t("reports.editReport")}
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <ErrorAlert message={error} />}

          <Grid container spacing={2}>
            {assignedCars.length > 1 && (
              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t("cars.title")}</InputLabel>
                  <Select
                    value={formData.car_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        car_id: e.target.value,
                      }))
                    }
                    label={t("cars.title")}
                  >
                    {assignedCars.map((car) => (
                      <MenuItem key={car.id} value={car.id}>
                        {car.year} {car.make} {car.model} - {car.license_plate}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={12}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {t("reports.weekPeriod")}
                </Typography>
                <Button
                  onClick={() => handleWeekNavigation("prev")}
                  size="small"
                  startIcon={<ChevronLeft />}
                  variant="outlined"
                  sx={{ minWidth: "auto" }}
                >
                  {t("reports.previousWeek")}
                </Button>
                <Button
                  onClick={() => handleWeekNavigation("next")}
                  size="small"
                  endIcon={<ChevronRight />}
                  variant="outlined"
                  sx={{ minWidth: "auto" }}
                >
                  {t("reports.nextWeek")}
                </Button>
              </Box>
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.weekStart")}
                type="date"
                value={formData.week_start_date}
                onChange={handleInputChange("week_start_date")}
                InputLabelProps={{ shrink: true }}
                helperText={t("reports.weekStartHelper")}
                disabled
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.weekEnd")}
                type="date"
                value={formData.week_end_date}
                onChange={handleInputChange("week_end_date")}
                InputLabelProps={{ shrink: true }}
                helperText={t("reports.weekEndHelper")}
                disabled
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.startMileage")}
                type="number"
                value={formData.start_mileage}
                onChange={handleInputChange("start_mileage")}
                inputProps={{ min: 0, step: 1 }}
                helperText={t("reports.startMileageHelper")}
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.endMileage")}
                type="number"
                value={formData.end_mileage}
                onChange={handleInputChange("end_mileage")}
                inputProps={{ min: 0, step: 1 }}
                helperText={t("reports.endMileageHelper")}
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.driverEarnings")}
                type="number"
                value={formData.driver_earnings}
                onChange={handleInputChange("driver_earnings")}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.currency}
                    </InputAdornment>
                  ),
                }}
                helperText={t("reports.driverEarningsHelper")}
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.maintenanceExpenses")}
                type="number"
                value={formData.maintenance_expenses}
                onChange={handleInputChange("maintenance_expenses")}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.currency}
                    </InputAdornment>
                  ),
                }}
                helperText={t("reports.maintenanceExpensesHelper")}
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.gasExpense")}
                type="number"
                value={formData.gas_expense}
                onChange={handleInputChange("gas_expense")}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.currency}
                    </InputAdornment>
                  ),
                }}
                helperText={t("reports.gasExpenseHelper")}
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.rideShareIncome")}
                type="number"
                value={formData.ride_share_income}
                onChange={handleInputChange("ride_share_income")}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.currency}
                    </InputAdornment>
                  ),
                }}
                helperText={t("reports.rideShareIncomeHelper")}
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t("reports.rentalIncome")}
                type="number"
                value={formData.rental_income}
                onChange={handleInputChange("rental_income")}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.currency}
                    </InputAdornment>
                  ),
                }}
                helperText={t("reports.rentalIncomeHelper")}
                required
              />
            </Grid>

            {formData.start_mileage > 0 && formData.end_mileage > 0 && (
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  {t("reports.totalDistance")}:{" "}
                  {formData.end_mileage - formData.start_mileage}{" "}
                  {t("common.km")}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="primary">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          type="submit"
        >
          {mode === "add" ? t("reports.addReport") : t("reports.updateReport")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeeklyReportDialog;
