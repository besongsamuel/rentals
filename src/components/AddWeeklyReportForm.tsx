import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Car, CreateWeeklyReportData } from "../types";
import ErrorAlert from "./ErrorAlert";

interface AddWeeklyReportFormProps {
  onSubmit: (reportData: CreateWeeklyReportData) => void;
  onCancel: () => void;
  assignedCars?: Car[];
}

const AddWeeklyReportForm: React.FC<AddWeeklyReportFormProps> = ({
  onSubmit,
  onCancel,
  assignedCars = [],
}) => {
  const [formData, setFormData] = useState({
    car_id: "",
    week_start_date: "",
    week_end_date: "",
    start_mileage: 0,
    end_mileage: 0,
    driver_earnings: 0,
    maintenance_expenses: 0,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.car_id.trim()) {
      setError("Car selection is required");
      return;
    }

    // Check if selected car is assigned to driver
    if (
      assignedCars.length > 0 &&
      !assignedCars.find((car) => car.id === formData.car_id)
    ) {
      setError("You can only create reports for cars assigned to you");
      return;
    }
    if (!formData.week_start_date) {
      setError("Week start date is required");
      return;
    }
    if (!formData.week_end_date) {
      setError("Week end date is required");
      return;
    }
    if (formData.end_mileage <= formData.start_mileage) {
      setError("End mileage must be greater than start mileage");
      return;
    }

    try {
      await onSubmit({
        car_id: formData.car_id.trim(),
        week_start_date: formData.week_start_date,
        week_end_date: formData.week_end_date,
        start_mileage: formData.start_mileage,
        end_mileage: formData.end_mileage,
        driver_earnings: formData.driver_earnings,
        maintenance_expenses: formData.maintenance_expenses,
      });
    } catch (error) {
      setError("Failed to create report. Please try again.");
    }
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSelectChange = (field: string) => (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Show message if no cars assigned
  if (assignedCars.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Add Weekly Report
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You need to be assigned to at least one car to create weekly reports.
          Contact an owner to get assigned to a vehicle.
        </Typography>
        <Button variant="outlined" onClick={onCancel}>
          Back
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Weekly Report
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <ErrorAlert message={error} />

        <Grid container spacing={2}>
          <Grid size={12}>
            <FormControl fullWidth required>
              <InputLabel>Select Car</InputLabel>
              <Select
                value={formData.car_id}
                onChange={handleSelectChange("car_id")}
                label="Select Car"
              >
                {assignedCars.map((car) => (
                  <MenuItem key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} - {car.vin}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={6}>
            <TextField
              required
              fullWidth
              label="Week Start Date"
              type="date"
              value={formData.week_start_date}
              onChange={handleInputChange("week_start_date")}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              required
              fullWidth
              label="Week End Date"
              type="date"
              value={formData.week_end_date}
              onChange={handleInputChange("week_end_date")}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              required
              fullWidth
              label="Start Mileage"
              type="number"
              value={formData.start_mileage}
              onChange={handleInputChange("start_mileage")}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              required
              fullWidth
              label="End Mileage"
              type="number"
              value={formData.end_mileage}
              onChange={handleInputChange("end_mileage")}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={4}>
            <TextField
              fullWidth
              label="Driver Earnings"
              type="number"
              value={formData.driver_earnings}
              onChange={handleInputChange("driver_earnings")}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="XAF"
            />
          </Grid>

          <Grid size={4}>
            <TextField
              fullWidth
              label="Maintenance Expenses"
              type="number"
              value={formData.maintenance_expenses}
              onChange={handleInputChange("maintenance_expenses")}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="XAF"
            />
          </Grid>
        </Grid>

        <Box
          sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create Report
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddWeeklyReportForm;
