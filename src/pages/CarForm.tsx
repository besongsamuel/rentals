import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
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
import { useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import FileUpload from "../components/FileUpload";
import { useUserContext } from "../contexts/UserContext";
import { carImageStorageService } from "../services/carImageStorageService";
import { carMakeModelService } from "../services/carMakeModelService";
import { carService } from "../services/carService";
import { profileService } from "../services/profileService";
import { CarMake, CarModel, CreateCarData, Profile } from "../types";

const CarForm: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { t } = useTranslation();
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
    fuel_type: "",
    transmission_type: "",
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
  const [carImageUrls, setCarImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load car makes
        const makes = await carMakeModelService.getCarMakes();
        setCarMakes(makes);

        // Only load owners when editing
        if (isEditMode) {
          const owners = await profileService.getAllOwners();
          setOwners(owners);
        }

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
              fuel_type: car.fuel_type || "",
              transmission_type: car.transmission_type || "",
            });

            // Load car images
            try {
              const imageUrls = await carImageStorageService.getCarImageUrls(
                carId!
              );
              setCarImageUrls(imageUrls);
            } catch (error) {
              console.error("Error loading car images:", error);
            }

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
        setError(t("cars.failedToLoadData"));
      } finally {
        setLoading(false);
        setLoadingOwners(false);
        setLoadingMakes(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId, isEditMode, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Basic validation
    if (!formData.vin.trim()) {
      setError(t("cars.vinRequired"));
      setSaving(false);
      return;
    }
    if (!formData.make.trim()) {
      setError(t("cars.makeRequired"));
      setSaving(false);
      return;
    }
    if (!formData.model.trim()) {
      setError(t("cars.modelRequired"));
      setSaving(false);
      return;
    }
    if (isEditMode && !formData.owner_id) {
      setError(t("cars.selectOwner"));
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
        owner_id: isEditMode ? formData.owner_id : user!.id,
        fuel_type:
          (formData.fuel_type as
            | "gasoline"
            | "diesel"
            | "hybrid"
            | "electric") || undefined,
        transmission_type:
          (formData.transmission_type as "manual" | "automatic") || undefined,
      };

      if (isEditMode) {
        // Update existing car
        // Note: Images are saved immediately when uploaded via FileUpload component
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
        isEditMode ? t("cars.failedToUpdateCar") : t("cars.failedToCreateCar")
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

  const handleCancel = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            {t("common.loading")}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 0 },
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{ textAlign: { xs: "center", sm: "left" } }}
          >
            {isEditMode ? t("cars.editCar") : t("cars.addNewCar")}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "auto", sm: "140px" },
            }}
          >
            {t("cars.backToDashboard")}
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                label={t("cars.vin")}
                value={formData.vin}
                onChange={handleInputChange("vin")}
                placeholder={t("cars.vinPlaceholder")}
                disabled={saving}
              />
            </Grid>

            {isEditMode && (
              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t("cars.owner")}</InputLabel>
                  <Select
                    value={formData.owner_id}
                    onChange={handleSelectChange("owner_id")}
                    label={t("cars.owner")}
                    disabled={loadingOwners || saving}
                  >
                    {loadingOwners ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        {t("cars.loadingOwners")}
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
            )}

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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>{t("cars.fuelType")}</InputLabel>
                <Select
                  value={formData.fuel_type}
                  onChange={handleSelectChange("fuel_type")}
                  label={t("cars.fuelType")}
                  disabled={saving}
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
                  disabled={saving}
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
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("cars.licensePlate")}
                value={formData.license_plate}
                onChange={handleInputChange("license_plate")}
                placeholder={t("cars.licensePlatePlaceholder")}
                disabled={saving}
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
                disabled={saving}
              />
            </Grid>

            {/* Car Images Section - Only show when editing */}
            {isEditMode ? (
              <Grid size={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t("cars.carImages")}
                </Typography>
                <FileUpload
                  bucket="cars"
                  path={carId!}
                  accept="image/*"
                  maxSizeMB={5}
                  multiple={true}
                  maxFiles={10}
                  isPublic={true}
                  existingFileUrl={carImageUrls}
                  onUploadComplete={async (urls) => {
                    const urlArray = Array.isArray(urls) ? urls : [urls];

                    // Update the local state with the new URLs from storage
                    setCarImageUrls(urlArray);
                  }}
                  label={t("cars.uploadCarImages")}
                  helperText={t("cars.carImagesHelper")}
                />
              </Grid>
            ) : (
              <Grid size={12}>
                <Divider sx={{ my: 3 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    p: 2,
                    bgcolor: "rgba(46, 125, 50, 0.05)",
                    borderRadius: 2,
                    border: "1px solid rgba(46, 125, 50, 0.2)",
                  }}
                >
                  💡 {t("cars.addImagesAfterCreation")}
                </Typography>
              </Grid>
            )}
          </Grid>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
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
              disabled={saving}
              sx={{
                width: { xs: "100%", sm: "auto" },
                order: { xs: 1, sm: 2 },
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {isEditMode ? t("cars.updating") : t("cars.creating")}
                </>
              ) : isEditMode ? (
                t("cars.updateCar")
              ) : (
                t("cars.addCar")
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CarForm;
