import {
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
import { carService } from "../services/carService";
import { profileService } from "../services/profileService";
import { CreateCarData, Profile } from "../types";

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
  const [loading, setLoading] = useState(true);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load owners first
        const owners = await profileService.getAllOwners(
          profile?.organization_id
        );
        setOwners(owners);

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
              <TextField
                required
                fullWidth
                label="Make"
                value={formData.make}
                onChange={handleInputChange("make")}
                placeholder="e.g., Toyota"
                disabled={saving}
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
                disabled={saving}
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
