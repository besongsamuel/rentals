import {
  Autocomplete,
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
import { carMakeModelService } from "../services/carMakeModelService";
import { profileService } from "../services/profileService";
import { CarMake, CarModel, CreateCarData, Profile } from "../types";
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
    fuel_type: "",
    transmission_type: "",
  });
  const [owners, setOwners] = useState<Profile[]>([]);
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState("");

  // Load owners and car makes on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ownersData, makesData] = await Promise.all([
          profileService.getAllOwners(organizationId),
          carMakeModelService.getCarMakes(),
        ]);
        setOwners(ownersData);
        setCarMakes(makesData);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoadingOwners(false);
        setLoadingMakes(false);
      }
    };

    loadData();
  }, [organizationId]);

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
        fuel_type:
          (formData.fuel_type as
            | "gasoline"
            | "diesel"
            | "hybrid"
            | "electric") || undefined,
        transmission_type:
          (formData.transmission_type as "manual" | "automatic") || undefined,
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

  const handleMakeChange = async (event: any, newValue: string | null) => {
    const selectedMakeName = newValue || "";
    setFormData((prev) => ({
      ...prev,
      make: selectedMakeName,
      model: "", // Reset model when make changes
    }));

    // Load models for the selected make
    if (selectedMakeName) {
      setLoadingModels(true);
      try {
        const selectedMake = carMakes.find((m) => m.name === selectedMakeName);
        if (selectedMake) {
          const models = await carMakeModelService.getCarModelsByMakeId(
            selectedMake.id
          );
          setCarModels(models);
        }
      } catch (error) {
        console.error("Error loading models:", error);
        setError("Failed to load car models. Please try again.");
      } finally {
        setLoadingModels(false);
      }
    } else {
      setCarModels([]);
    }
  };

  const handleModelChange = (event: any, newValue: string | null) => {
    setFormData((prev) => ({
      ...prev,
      model: newValue || "",
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
            <Autocomplete
              freeSolo
              options={carMakes.map((make) => make.name)}
              value={formData.make}
              onChange={handleMakeChange}
              onInputChange={(event, newInputValue) => {
                setFormData((prev) => ({
                  ...prev,
                  make: newInputValue,
                  model: "", // Reset model when make changes
                }));
              }}
              loading={loadingMakes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Make"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingMakes ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={6}>
            <Autocomplete
              freeSolo
              options={carModels.map((model) => model.name)}
              value={formData.model}
              onChange={handleModelChange}
              onInputChange={(event, newInputValue) => {
                setFormData((prev) => ({
                  ...prev,
                  model: newInputValue,
                }));
              }}
              loading={loadingModels}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Model"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingModels ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
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
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={formData.fuel_type}
                onChange={handleSelectChange("fuel_type")}
                label="Fuel Type"
              >
                <MenuItem value="">
                  <em>Select fuel type</em>
                </MenuItem>
                <MenuItem value="gasoline">Gasoline</MenuItem>
                <MenuItem value="diesel">Diesel</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
                <MenuItem value="electric">Electric</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={4}>
            <FormControl fullWidth>
              <InputLabel>Transmission</InputLabel>
              <Select
                value={formData.transmission_type}
                onChange={handleSelectChange("transmission_type")}
                label="Transmission"
              >
                <MenuItem value="">
                  <em>Select transmission</em>
                </MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="automatic">Automatic</MenuItem>
              </Select>
            </FormControl>
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
