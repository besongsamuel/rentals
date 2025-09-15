import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { profileService } from "../services/profileService";
import { CreateCarData, Profile } from "../types";
import ErrorAlert from "./ErrorAlert";

interface AddCarFormProps {
  onSubmit: (carData: CreateCarData) => void;
  onCancel: () => void;
  organizationId?: string; // Organization ID to filter owners by
}

const AddCarForm: React.FC<AddCarFormProps> = ({
  onSubmit,
  onCancel,
  organizationId,
}) => {
  const [formData, setFormData] = useState({
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    license_plate: "",
    initial_mileage: 0,
    owner_id: "",
  });
  const [owners, setOwners] = useState<Profile[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [error, setError] = useState("");

  // Load owners on component mount
  useEffect(() => {
    const loadOwners = async () => {
      try {
        const ownersData = await profileService.getAllOwners(organizationId);
        setOwners(ownersData);
      } catch (error) {
        console.error("Error loading owners:", error);
        setError("Failed to load owners. Please try again.");
      } finally {
        setLoadingOwners(false);
      }
    };

    loadOwners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.vin.trim()) {
      setError("VIN is required");
      return;
    }
    if (!formData.make.trim()) {
      setError("Make is required");
      return;
    }
    if (!formData.model.trim()) {
      setError("Model is required");
      return;
    }
    if (!formData.owner_id) {
      setError("Please select an owner");
      return;
    }

    try {
      await onSubmit({
        vin: formData.vin.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year,
        color: formData.color.trim() || undefined,
        license_plate: formData.license_plate.trim() || undefined,
        initial_mileage: formData.initial_mileage,
        owner_id: formData.owner_id,
      });
    } catch (error) {
      setError("Failed to add car. Please try again.");
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

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add New Car
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <ErrorAlert message={error} />

        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              required
              fullWidth
              label="VIN"
              value={formData.vin}
              onChange={handleInputChange("vin")}
              placeholder="Enter VIN number"
            />
          </Grid>

          <Grid size={12}>
            <FormControl fullWidth required>
              <InputLabel>Owner</InputLabel>
              <Select
                value={formData.owner_id}
                onChange={handleSelectChange("owner_id")}
                label="Owner"
                disabled={loadingOwners}
              >
                {loadingOwners ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading owners...
                  </MenuItem>
                ) : (
                  owners.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id}>
                      {owner.full_name || owner.email}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={6}>
            <TextField
              required
              fullWidth
              label="Make"
              value={formData.make}
              onChange={handleInputChange("make")}
              placeholder="e.g., Toyota"
            />
          </Grid>

          <Grid size={6}>
            <TextField
              required
              fullWidth
              label="Model"
              value={formData.model}
              onChange={handleInputChange("model")}
              placeholder="e.g., Camry"
            />
          </Grid>

          <Grid size={4}>
            <TextField
              required
              fullWidth
              label="Year"
              type="number"
              value={formData.year}
              onChange={handleInputChange("year")}
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
            />
          </Grid>

          <Grid size={4}>
            <TextField
              fullWidth
              label="Color"
              value={formData.color}
              onChange={handleInputChange("color")}
              placeholder="e.g., Red"
            />
          </Grid>

          <Grid size={4}>
            <TextField
              fullWidth
              label="License Plate"
              value={formData.license_plate}
              onChange={handleInputChange("license_plate")}
              placeholder="e.g., ABC-123"
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Initial Mileage"
              type="number"
              value={formData.initial_mileage}
              onChange={handleInputChange("initial_mileage")}
              inputProps={{ min: 0 }}
              helperText="Current mileage in KM when adding the car"
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
            Add Car
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddCarForm;
