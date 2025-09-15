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
import React, { useEffect, useState } from "react";
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

  const [formData, setFormData] = useState({
    car_id: "",
    week_start_date: "",
    week_end_date: "",
    start_mileage: 0,
    end_mileage: 0,
    driver_earnings: 0,
    maintenance_expenses: 0,
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
          ride_share_income: (editingReport as any).ride_share_income || 0,
          rental_income: (editingReport as any).rental_income || 0,
          currency: (editingReport as any).currency || "XAF",
        });
      } else {
        // Reset form for add mode
        setFormData({
          car_id: assignedCars.length === 1 ? assignedCars[0].id : "",
          week_start_date: "",
          week_end_date: "",
          start_mileage: 0,
          end_mileage: 0,
          driver_earnings: 0,
          maintenance_expenses: 0,
          ride_share_income: 0,
          rental_income: 0,
          currency: "XAF",
        });
      }
      setError("");
    }
  }, [open, mode, editingReport, assignedCars]);

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
      setError("Car selection is required");
      return;
    }

    if (mode === "add") {
      // Check if selected car is assigned to driver
      if (
        assignedCars.length > 0 &&
        !assignedCars.some((car) => car.id === formData.car_id)
      ) {
        setError("You can only create reports for cars assigned to you");
        return;
      }
    }

    if (!formData.week_start_date || !formData.week_end_date) {
      setError("Week start and end dates are required");
      return;
    }

    if (formData.start_mileage < 0 || formData.end_mileage < 0) {
      setError("Mileage values must be non-negative");
      return;
    }

    if (formData.end_mileage < formData.start_mileage) {
      setError("End mileage must be greater than or equal to start mileage");
      return;
    }

    if (formData.driver_earnings < 0) {
      setError("Driver earnings must be non-negative");
      return;
    }

    if (formData.maintenance_expenses < 0) {
      setError("Maintenance expenses must be non-negative");
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
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
        {mode === "add" ? "Add New Weekly Report" : "Edit Weekly Report"}
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <ErrorAlert message={error} />}

          <Grid container spacing={2}>
            {assignedCars.length > 1 && (
              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel>Car</InputLabel>
                  <Select
                    value={formData.car_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        car_id: e.target.value,
                      }))
                    }
                    label="Car"
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

            <Grid size={6}>
              <TextField
                fullWidth
                label="Week Start Date"
                type="date"
                value={formData.week_start_date}
                onChange={handleInputChange("week_start_date")}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Week End Date"
                type="date"
                value={formData.week_end_date}
                onChange={handleInputChange("week_end_date")}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Start Mileage"
                type="number"
                value={formData.start_mileage}
                onChange={handleInputChange("start_mileage")}
                inputProps={{ min: 0, step: 1 }}
                helperText="KM"
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="End Mileage"
                type="number"
                value={formData.end_mileage}
                onChange={handleInputChange("end_mileage")}
                inputProps={{ min: 0, step: 1 }}
                helperText="KM"
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Driver Earnings"
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
                helperText="Driver's earnings for the week"
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Maintenance Expenses"
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
                helperText="Maintenance and repair costs"
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Ride Share Income"
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
                helperText="How much was made from Yango ride share this week?"
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Rental Income"
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
                helperText="Income from car rental services"
                required
              />
            </Grid>

            {formData.start_mileage > 0 && formData.end_mileage > 0 && (
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Total Distance:{" "}
                  {formData.end_mileage - formData.start_mileage} KM
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          type="submit"
        >
          {mode === "add" ? "Add Report" : "Update Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeeklyReportDialog;
