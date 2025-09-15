import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CreateIncomeSourceData } from "../services/incomeSourceService";

interface IncomeSourceFormProps {
  onSubmit: (data: CreateIncomeSourceData) => void;
  onCancel: () => void;
  weeklyReportId: string;
}

const IncomeSourceForm: React.FC<IncomeSourceFormProps> = ({
  onSubmit,
  onCancel,
  weeklyReportId,
}) => {
  const [formData, setFormData] = useState<CreateIncomeSourceData>({
    weekly_report_id: weeklyReportId,
    source_type: "rentals",
    amount: 0,
    notes: "",
  });

  const handleInputChange =
    (field: keyof CreateIncomeSourceData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "amount"
          ? parseFloat(event.target.value) || 0
          : event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSelectChange =
    (field: keyof CreateIncomeSourceData) => (event: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Income Source
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Source Type</InputLabel>
            <Select
              value={formData.source_type}
              onChange={handleSelectChange("source_type")}
              label="Source Type"
            >
              <MenuItem value="rentals">Rentals</MenuItem>
              <MenuItem value="ride_share">Ride Share</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange("amount")}
            helperText="XAF"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleInputChange("notes")}
            placeholder="Additional details about this income source..."
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add Income Source
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IncomeSourceForm;
