import { Add, ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
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

  // Entry mode: weekly or daily
  const [entryMode, setEntryMode] = useState<"weekly" | "daily">("weekly");
  const [dailyDate, setDailyDate] = useState<string>("");

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
    taxi_income: 0,
    currency: "XAF",
  });
  const [error, setError] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogField, setAddDialogField] = useState<string>("");
  const [addDialogValue, setAddDialogValue] = useState<number>(0);

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
          taxi_income: (editingReport as any).taxi_income || 0,
          currency: (editingReport as any).currency || "XAF",
        });
        // Determine entry mode from existing dates
        const isDaily =
          editingReport.week_start_date === editingReport.week_end_date;
        setEntryMode(isDaily ? "daily" : "weekly");
        setDailyDate(editingReport.week_start_date);
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
          taxi_income: 0,
          currency: "XAF",
        });
        setEntryMode("weekly");
        setDailyDate(formatDateForInput(new Date()));
      }
      setError("");
    }
  }, [
    open,
    mode,
    editingReport,
    assignedCars,
    getCurrentWeek,
    formatDateForInput,
  ]);

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

  const handleAddButtonClick = (field: string) => {
    setAddDialogField(field);
    setAddDialogValue(0);
    setAddDialogOpen(true);
  };

  const handleAddDialogSubmit = () => {
    if (addDialogValue > 0) {
      setFormData((prev) => ({
        ...prev,
        [addDialogField]:
          (prev[addDialogField as keyof typeof prev] as number) +
          addDialogValue,
      }));
    }
    setAddDialogOpen(false);
    setAddDialogValue(0);
    setAddDialogField("");
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setAddDialogValue(0);
    setAddDialogField("");
  };

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      driver_earnings: t("reports.driverEarnings"),
      maintenance_expenses: t("reports.maintenanceExpenses"),
      gas_expense: t("reports.gasExpense"),
      ride_share_income: t("reports.rideShareIncome"),
      rental_income: t("reports.rentalIncome"),
      taxi_income: t("reports.taxiIncome"),
    };
    return labels[field] || field;
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
      // In daily mode, ensure start and end dates are the selected daily date
      const payload =
        entryMode === "daily"
          ? {
              ...formData,
              week_start_date: dailyDate,
              week_end_date: dailyDate,
            }
          : formData;
      onSubmit(payload);
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

  // Handle switch between weekly and daily modes
  const handleEntryModeChange = (
    e: React.ChangeEvent<{ value: unknown }> | any
  ) => {
    const value = (e.target?.value as "weekly" | "daily") || "weekly";
    setEntryMode(value);
    if (value === "daily") {
      // set both dates to today initially
      const today = formatDateForInput(new Date());
      setDailyDate(today);
      setFormData((prev) => ({
        ...prev,
        week_start_date: today,
        week_end_date: today,
      }));
    } else {
      // revert to the current week window based on existing start date or today
      const base = formData.week_start_date
        ? new Date(formData.week_start_date)
        : new Date();
      const start = formatDateForInput(getWeekStart(base));
      const end = formatDateForInput(getWeekEnd(base));
      setFormData((prev) => ({
        ...prev,
        week_start_date: start,
        week_end_date: end,
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        id="weekly-report-dialog-title"
        sx={{
          color: "text.primary",
          fontWeight: 600,
          textAlign: "center",
          pt: 3,
          pb: 2,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {mode === "add" ? t("reports.addReport") : t("reports.editReport")}
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <ErrorAlert message={error} />}

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Entry Mode Selector */}
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>{t("reports.entryMode")}</InputLabel>
                <Select
                  value={entryMode}
                  label={t("reports.entryMode")}
                  onChange={handleEntryModeChange}
                >
                  <MenuItem value="weekly">{t("reports.weekly")}</MenuItem>
                  <MenuItem value="daily">{t("reports.daily")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
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

            {entryMode === "weekly" && (
              <Grid size={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: 2,
                    mb: 3,
                    p: 2,
                    background: "rgba(37, 99, 235, 0.02)",
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      flexGrow: 1,
                      color: "text.primary",
                      fontWeight: 600,
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    {t("reports.weekPeriod")}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: { xs: "center", sm: "flex-end" },
                    }}
                  >
                    <Button
                      onClick={() => handleWeekNavigation("prev")}
                      size="small"
                      startIcon={<ChevronLeft />}
                      variant="outlined"
                      sx={{
                        minWidth: "auto",
                        flex: { xs: 1, sm: "none" },
                      }}
                    >
                      {t("reports.previousWeek")}
                    </Button>
                    <Button
                      onClick={() => handleWeekNavigation("next")}
                      size="small"
                      endIcon={<ChevronRight />}
                      variant="outlined"
                      sx={{
                        minWidth: "auto",
                        flex: { xs: 1, sm: "none" },
                      }}
                    >
                      {t("reports.nextWeek")}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            )}

            {entryMode === "daily" && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("reports.dailyDate")}
                  type="date"
                  value={dailyDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDailyDate(val);
                    setFormData((prev) => ({
                      ...prev,
                      week_start_date: val,
                      week_end_date: val,
                    }));
                  }}
                  InputLabelProps={{ shrink: true }}
                  helperText={t("reports.dailyDateHelper")}
                  required
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
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
                {mode === "edit" && editingReport?.status === "draft" && (
                  <Tooltip title={t("reports.addAmount")}>
                    <IconButton
                      onClick={() => handleAddButtonClick("driver_earnings")}
                      sx={{
                        mt: 1,
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
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
                {mode === "edit" && editingReport?.status === "draft" && (
                  <Tooltip title={t("reports.addAmount")}>
                    <IconButton
                      onClick={() =>
                        handleAddButtonClick("maintenance_expenses")
                      }
                      sx={{
                        mt: 1,
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
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
                {mode === "edit" && editingReport?.status === "draft" && (
                  <Tooltip title={t("reports.addAmount")}>
                    <IconButton
                      onClick={() => handleAddButtonClick("gas_expense")}
                      sx={{
                        mt: 1,
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
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
                {mode === "edit" && editingReport?.status === "draft" && (
                  <Tooltip title={t("reports.addAmount")}>
                    <IconButton
                      onClick={() => handleAddButtonClick("ride_share_income")}
                      sx={{
                        mt: 1,
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
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
                {mode === "edit" && editingReport?.status === "draft" && (
                  <Tooltip title={t("reports.addAmount")}>
                    <IconButton
                      onClick={() => handleAddButtonClick("rental_income")}
                      sx={{
                        mt: 1,
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <TextField
                  fullWidth
                  label={t("reports.taxiIncome")}
                  type="number"
                  value={formData.taxi_income}
                  onChange={handleInputChange("taxi_income")}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {formData.currency}
                      </InputAdornment>
                    ),
                  }}
                  helperText={t("reports.taxiIncomeHelper")}
                  required
                />
                {mode === "edit" && editingReport?.status === "draft" && (
                  <Tooltip title={t("reports.addAmount")}>
                    <IconButton
                      onClick={() => handleAddButtonClick("taxi_income")}
                      sx={{
                        mt: 1,
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>

            {formData.start_mileage > 0 && formData.end_mileage > 0 && (
              <Grid size={12}>
                <Box
                  sx={{
                    p: 2,
                    background: "rgba(5, 150, 105, 0.02)",
                    borderRadius: 1,
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  >
                    {t("reports.totalDistance")}:{" "}
                    <Box
                      component="span"
                      sx={{ color: "success.main", fontWeight: 600 }}
                    >
                      {formData.end_mileage - formData.start_mileage}{" "}
                      {t("common.km")}
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          color="primary"
          sx={{
            width: { xs: "100%", sm: "auto" },
            order: { xs: 2, sm: 1 },
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          type="submit"
          sx={{
            width: { xs: "100%", sm: "auto" },
            order: { xs: 1, sm: 2 },
          }}
        >
          {mode === "add" ? t("reports.addReport") : t("reports.updateReport")}
        </Button>
      </DialogActions>

      {/* Add Amount Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "1.25rem",
            fontWeight: 400,
            color: "#1d1d1f",
            pb: 1,
          }}
        >
          {t("reports.addAmount")}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <DialogContentText
            sx={{
              color: "#86868b",
              fontSize: "0.875rem",
              textAlign: "center",
              mb: 3,
              lineHeight: 1.4,
            }}
          >
            {t("reports.addAmountDescription", {
              field: getFieldLabel(addDialogField),
            })}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label={t("reports.amountToAdd")}
            type="number"
            value={addDialogValue}
            onChange={(e) => setAddDialogValue(parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {formData.currency}
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 122, 255, 0.5)",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleAddDialogClose}
            sx={{
              textTransform: "none",
              color: "#86868b",
              fontWeight: 400,
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAddDialogSubmit}
            disabled={addDialogValue <= 0}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#007AFF",
              fontWeight: 400,
              fontSize: "0.875rem",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                backgroundColor: "#0056CC",
              },
              "&:disabled": {
                backgroundColor: "#C7C7CC",
                color: "#8E8E93",
              },
            }}
          >
            {t("reports.addAmount")}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default WeeklyReportDialog;
