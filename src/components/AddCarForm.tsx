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
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { carMakeModelService } from "../services/carMakeModelService";
import { CarMake, CarModel, CreateCarData } from "../types";
import ErrorAlert from "./ErrorAlert";

interface AddCarFormProps {
  onSubmit: (carData: CreateCarData) => void;
  onCancel: () => void;
}

const AddCarForm: React.FC<AddCarFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    license_plate: "",
    initial_mileage: 0,
    fuel_type: "",
    transmission_type: "",
  });
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState("");

  // Load car makes on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingMakes(true);

        // Load car makes
        const makesData = await carMakeModelService.getCarMakes();
        setCarMakes(makesData);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(t("cars.failedToLoadData"));
      } finally {
        setLoadingMakes(false);
      }
    };

    loadData();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.vin.trim()) {
      setError(t("cars.vinRequired"));
      return;
    }
    if (!formData.make.trim()) {
      setError(t("cars.makeRequired"));
      return;
    }
    if (!formData.model.trim()) {
      setError(t("cars.modelRequired"));
      return;
    }
    if (!user) {
      setError(t("cars.failedToCreateCar"));
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
        owner_id: user.id,
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
      setError(t("cars.failedToCreateCar"));
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
        setError(t("cars.failedToLoadModels"));
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
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: { xs: "center", sm: "left" } }}
      >
        {t("cars.addNewCar")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <ErrorAlert message={error} />

        <Grid container spacing={{ xs: 2, sm: 2 }}>
          <Grid size={12}>
            <TextField
              required
              fullWidth
              label={t("cars.vin")}
              value={formData.vin}
              onChange={handleInputChange("vin")}
              placeholder={t("cars.vinPlaceholder")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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
                  label={t("cars.make")}
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

          <Grid size={{ xs: 12, sm: 6 }}>
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
                  label={t("cars.model")}
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

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              required
              fullWidth
              label={t("cars.year")}
              type="number"
              value={formData.year}
              onChange={handleInputChange("year")}
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>{t("cars.fuelType")}</InputLabel>
              <Select
                value={formData.fuel_type}
                onChange={handleSelectChange("fuel_type")}
                label={t("cars.fuelType")}
              >
                <MenuItem value="">
                  <em>{t("cars.selectFuelType")}</em>
                </MenuItem>
                <MenuItem value="gasoline">{t("cars.gasoline")}</MenuItem>
                <MenuItem value="diesel">{t("cars.diesel")}</MenuItem>
                <MenuItem value="hybrid">{t("cars.hybrid")}</MenuItem>
                <MenuItem value="electric">{t("cars.electric")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>{t("cars.transmission")}</InputLabel>
              <Select
                value={formData.transmission_type}
                onChange={handleSelectChange("transmission_type")}
                label={t("cars.transmission")}
              >
                <MenuItem value="">
                  <em>{t("cars.selectTransmission")}</em>
                </MenuItem>
                <MenuItem value="manual">{t("cars.manual")}</MenuItem>
                <MenuItem value="automatic">{t("cars.automatic")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("cars.color")}
              value={formData.color}
              onChange={handleInputChange("color")}
              placeholder={t("cars.colorPlaceholder")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t("cars.licensePlate")}
              value={formData.license_plate}
              onChange={handleInputChange("license_plate")}
              placeholder={t("cars.licensePlatePlaceholder")}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label={t("cars.initialMileage")}
              type="number"
              value={formData.initial_mileage}
              onChange={handleInputChange("initial_mileage")}
              inputProps={{ min: 0 }}
              helperText={t("cars.initialMileageHelper")}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              width: { xs: "100%", sm: "auto" },
              order: { xs: 2, sm: 1 },
            }}
          >
            {t("cars.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              width: { xs: "100%", sm: "auto" },
              order: { xs: 1, sm: 2 },
            }}
          >
            {t("cars.addCar")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddCarForm;
