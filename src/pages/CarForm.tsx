import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
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
import { useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import { useUserContext } from "../contexts/UserContext";
import { carMakeModelService } from "../services/carMakeModelService";
import { carService } from "../services/carService";
import { profileService } from "../services/profileService";
import { CarMake, CarModel, CreateCarData, Profile } from "../types";

const CarForm: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useUserContext();
  const isEditMode = carId && carId !== "new";

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
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load owners and car makes in parallel
        const [owners, makes] = await Promise.all([
          profileService.getAllOwners(profile?.organization_id),
          carMakeModelService.getCarMakes(),
        ]);

        setOwners(owners);
        setCarMakes(makes);

        // Load car data if editing
        if (isEditMode) {
          const car = await carService.getCarById(carId!);
          if (car) {
            setFormData({
              vin: car.vin,
              make: car.make,
              model: car.model,
              year: car.year,
              color: car.color || "",
              license_plate: car.license_plate || "",
              initial_mileage: car.initial_mileage,
              owner_id: car.owner_id || "",
            });

            // Load models for the selected make
            if (car.make) {
              const selectedMake = makes.find((m) => m.name === car.make);
              if (selectedMake) {
                setLoadingModels(true);
                try {
                  const models = await carMakeModelService.getCarModelsByMakeId(
                    selectedMake.id
                  );
                  setCarModels(models);
                } catch (error) {
                  console.error("Error loading models:", error);
                } finally {
                  setLoadingModels(false);
                }
              }
            }
          }
        } else if (!isEditMode && user?.id) {
          // For new cars, set current user as default owner
          setFormData((prev) => ({
            ...prev,
            owner_id: user.id,
          }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
        setLoadingOwners(false);
        setLoadingMakes(false);
      }
    };

    loadData();
  }, [carId, isEditMode, user?.id, profile?.organization_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Basic validation
    if (!formData.vin.trim()) {
      setError("VIN is required");
      setSaving(false);
      return;
    }
    if (!formData.make.trim()) {
      setError("Make is required");
      setSaving(false);
      return;
    }
    if (!formData.model.trim()) {
      setError("Model is required");
      setSaving(false);
      return;
    }
    if (!formData.owner_id) {
      setError("Please select an owner");
      setSaving(false);
      return;
    }

    try {
      const carData: CreateCarData = {
        vin: formData.vin.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year,
        color: formData.color.trim() || undefined,
        license_plate: formData.license_plate.trim() || undefined,
        initial_mileage: formData.initial_mileage,
        owner_id: formData.owner_id,
      };

      if (isEditMode) {
        // Update existing car
        await carService.updateCar(carId!, {
          ...carData,
          current_mileage: formData.initial_mileage,
        });
      } else {
        // Create new car
        await carService.createCar(carData);
      }

      // Navigate back to dashboard
      navigate("/");
    } catch (error) {
      console.error("Error saving car:", error);
      setError(
        isEditMode
          ? "Failed to update car. Please try again."
          : "Failed to create car. Please try again."
      );
    } finally {
      setSaving(false);
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

  const handleCancel = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">
            {isEditMode ? "Edit Car" : "Add New Car"}
          </Typography>
          <Button variant="outlined" onClick={handleCancel}>
            Back to Dashboard
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />

          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                label="VIN"
                value={formData.vin}
                onChange={handleInputChange("vin")}
                placeholder="Enter VIN number"
                disabled={saving}
              />
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth required>
                <InputLabel>Owner</InputLabel>
                <Select
                  value={formData.owner_id}
                  onChange={handleSelectChange("owner_id")}
                  label="Owner"
                  disabled={loadingOwners || saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            </Grid>

            <Grid size={4}>
              <TextField
                fullWidth
                label="Color"
                value={formData.color}
                onChange={handleInputChange("color")}
                placeholder="e.g., Red"
                disabled={saving}
              />
            </Grid>

            <Grid size={4}>
              <TextField
                fullWidth
                label="License Plate"
                value={formData.license_plate}
                onChange={handleInputChange("license_plate")}
                placeholder="e.g., ABC-123"
                disabled={saving}
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
                disabled={saving}
              />
            </Grid>
          </Grid>

          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Car"
              ) : (
                "Add Car"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CarForm;
