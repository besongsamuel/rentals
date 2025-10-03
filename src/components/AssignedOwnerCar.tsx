import {
  Assessment,
  CalendarToday,
  ConfirmationNumber,
  Description,
  DirectionsCar,
  Edit,
  LocalGasStation,
  Palette,
  Person,
  Settings,
  Speed,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { carImageStorageService } from "../services/carImageStorageService";
import { carMakeModelService } from "../services/carMakeModelService";
import { weeklyReportService } from "../services/weeklyReportService";
import { Car, CarMake, CarModel } from "../types";

interface AssignedOwnerCarProps {
  car: Car;
}

const AssignedOwnerCar: React.FC<AssignedOwnerCarProps> = ({ car }) => {
  const { t } = useTranslation();
  const [calculatedCurrentMileage, setCalculatedCurrentMileage] = useState<
    number | null
  >(null);
  const [loadingMileage, setLoadingMileage] = useState(true);
  const [carMake, setCarMake] = useState<CarMake | null>(null);
  const [carModel, setCarModel] = useState<CarModel | null>(null);
  const [loadingCarInfo, setLoadingCarInfo] = useState(true);
  const [reportCount, setReportCount] = useState<number>(0);
  const [loadingReportCount, setLoadingReportCount] = useState(true);
  const [carImageUrl, setCarImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const calculateCurrentMileage = async () => {
      try {
        setLoadingMileage(true);
        const totalMileageFromReports =
          await weeklyReportService.getTotalMileageForCar(car.id);
        const currentMileage = car.initial_mileage + totalMileageFromReports;
        setCalculatedCurrentMileage(currentMileage);
      } catch (error) {
        console.error("Error calculating current mileage:", error);
        // Fallback to the stored current_mileage if calculation fails
        setCalculatedCurrentMileage(car.current_mileage);
      } finally {
        setLoadingMileage(false);
      }
    };

    calculateCurrentMileage();
  }, [car.id, car.initial_mileage, car.current_mileage]);

  // Load car make/model information
  useEffect(() => {
    const loadCarInfo = async () => {
      try {
        setLoadingCarInfo(true);
        const { make, model } = await carMakeModelService.getCarMakeModelByName(
          car.make,
          car.model
        );
        setCarMake(make);
        setCarModel(model);
      } catch (error) {
        console.error("Error loading car make/model info:", error);
        setCarMake(null);
        setCarModel(null);
      } finally {
        setLoadingCarInfo(false);
      }
    };

    loadCarInfo();
  }, [car.make, car.model]);

  // Load report count
  useEffect(() => {
    const loadReportCount = async () => {
      try {
        setLoadingReportCount(true);
        const count = await weeklyReportService.getReportCountForCar(car.id);
        setReportCount(count);
      } catch (error) {
        console.error("Error loading report count:", error);
        setReportCount(0);
      } finally {
        setLoadingReportCount(false);
      }
    };

    loadReportCount();
  }, [car.id]);

  // Load first car image
  useEffect(() => {
    const loadCarImage = async () => {
      try {
        setLoadingImage(true);
        const imageUrl = await carImageStorageService.getFirstCarImageUrl(
          car.id
        );
        setCarImageUrl(imageUrl);
      } catch (error) {
        console.error("Error loading car image:", error);
        setCarImageUrl(null);
      } finally {
        setLoadingImage(false);
      }
    };

    loadCarImage();
  }, [car.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "assigned":
        return "primary";
      case "maintenance":
        return "warning";
      case "retired":
        return "default";
      default:
        return "default";
    }
  };

  const getFuelTypeIcon = (fuelType: string | null) => {
    switch (fuelType) {
      case "gasoline":
        return "⛽";
      case "diesel":
        return "🛢️";
      case "hybrid":
        return "🔋";
      case "electric":
        return "⚡";
      default:
        return "⛽";
    }
  };

  const getTransmissionIcon = (transmission: string | null) => {
    switch (transmission) {
      case "manual":
        return "🔄";
      case "automatic":
        return "⚙️";
      default:
        return "⚙️";
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        width: "100%",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 3,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      {/* Car Image */}
      {loadingImage ? (
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            height: 280,
            borderRadius: "12px 12px 0 0",
          }}
        />
      ) : carImageUrl ? (
        <Box
          component="img"
          src={carImageUrl}
          alt={`${car.make} ${car.model}`}
          sx={{
            width: "100%",
            height: 280,
            objectFit: "contain",
            borderRadius: "12px 12px 0 0",
            bgcolor: "rgba(0, 0, 0, 0.02)",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <DirectionsCar sx={{ fontSize: 120, color: "text.disabled" }} />
        </Box>
      )}

      <CardContent sx={{ p: 4 }}>
        {/* Header with Car Title and Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            {/* Car Name */}
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: "bold",
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
                mb: 2,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              {car.year} {car.make} {car.model}
            </Typography>

            {/* Car Model Details */}
            {!loadingCarInfo && carModel && (
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {carModel.body_type && (
                  <Chip
                    label={carModel.body_type}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.8rem",
                      height: 24,
                      textTransform: "capitalize",
                    }}
                  />
                )}
                {carModel.fuel_type && (
                  <Chip
                    label={`${getFuelTypeIcon(carModel.fuel_type)} ${
                      carModel.fuel_type
                    }`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.8rem",
                      height: 24,
                      textTransform: "capitalize",
                    }}
                  />
                )}
              </Box>
            )}

            <Chip
              label={car.status.charAt(0).toUpperCase() + car.status.slice(1)}
              color={getStatusColor(car.status) as any}
              size="medium"
              sx={{
                fontWeight: 500,
                textTransform: "capitalize",
                fontSize: "0.875rem",
                height: 32,
              }}
            />
          </Box>
        </Box>

        {/* Car Details Grid - Full Width Layout */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* VIN */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ConfirmationNumber
                sx={{
                  mr: 1.5,
                  fontSize: 20,
                  color: "text.secondary",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.vin")}:
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1D1D1F",
                fontFamily: "monospace",
                fontSize: "0.875rem",
              }}
            >
              {car.vin}
            </Typography>
          </Grid>

          {/* License Plate */}
          {car.license_plate && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <DirectionsCar
                  sx={{
                    mr: 1.5,
                    fontSize: 20,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.license")}:
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#1D1D1F",
                  fontSize: "0.875rem",
                }}
              >
                {car.license_plate}
              </Typography>
            </Grid>
          )}

          {/* Color */}
          {car.color && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Palette
                  sx={{
                    mr: 1.5,
                    fontSize: 20,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.color")}:
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#1D1D1F",
                  textTransform: "capitalize",
                  fontSize: "0.875rem",
                }}
              >
                {car.color}
              </Typography>
            </Grid>
          )}

          {/* Year */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarToday
                sx={{
                  mr: 1.5,
                  fontSize: 20,
                  color: "text.secondary",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.year")}:
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1D1D1F",
                fontSize: "0.875rem",
              }}
            >
              {car.year}
            </Typography>
          </Grid>

          {/* Current Mileage */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Speed
                sx={{
                  mr: 1.5,
                  fontSize: 20,
                  color: "text.secondary",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.currentMileage")}:
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1D1D1F",
                fontSize: "0.875rem",
              }}
            >
              {loadingMileage
                ? "..."
                : (
                    calculatedCurrentMileage || car.current_mileage
                  ).toLocaleString()}{" "}
              {t("dashboard.km")}
              {calculatedCurrentMileage &&
                calculatedCurrentMileage !== car.current_mileage && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      ml: 1,
                      color: "primary.main",
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                    }}
                  >
                    (calculated)
                  </Typography>
                )}
            </Typography>
          </Grid>

          {/* Initial Mileage */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Speed
                sx={{
                  mr: 1.5,
                  fontSize: 20,
                  color: "text.secondary",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.initialMileage")}:
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1D1D1F",
                fontSize: "0.875rem",
              }}
            >
              {car.initial_mileage.toLocaleString()} {t("dashboard.km")}
            </Typography>
          </Grid>

          {/* Fuel Type */}
          {car.fuel_type && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocalGasStation
                  sx={{
                    mr: 1.5,
                    fontSize: 20,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.fuelType")}:
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    mr: 1,
                    fontSize: "1.2rem",
                  }}
                >
                  {getFuelTypeIcon(car.fuel_type)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "#1D1D1F",
                    textTransform: "capitalize",
                    fontSize: "0.875rem",
                  }}
                >
                  {car.fuel_type}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Transmission Type */}
          {car.transmission_type && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Settings
                  sx={{
                    mr: 1.5,
                    fontSize: 20,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.transmission")}:
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    mr: 1,
                    fontSize: "1.2rem",
                  }}
                >
                  {getTransmissionIcon(car.transmission_type)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "#1D1D1F",
                    textTransform: "capitalize",
                    fontSize: "0.875rem",
                  }}
                >
                  {car.transmission_type}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Report Count */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Description
                sx={{
                  mr: 1.5,
                  fontSize: 20,
                  color: "text.secondary",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("statistics.reports")}:
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1D1D1F",
                fontSize: "0.875rem",
              }}
            >
              {loadingReportCount
                ? "..."
                : `${reportCount} ${
                    reportCount === 1
                      ? t("statistics.report")
                      : t("statistics.reports")
                  }`}
            </Typography>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 3,
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              component={Link}
              to={`/cars/${car.id}/edit`}
              variant="outlined"
              startIcon={<Edit />}
              sx={{
                borderColor: "#007AFF",
                color: "#007AFF",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#0056CC",
                  backgroundColor: "rgba(0, 122, 255, 0.04)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {t("cars.editCar")}
            </Button>

            <Button
              component={Link}
              to={`/cars/${car.id}`}
              variant="contained"
              startIcon={<Assessment />}
              sx={{
                bgcolor: "#d32f2f",
                color: "white",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "0.875rem",
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                "&:hover": {
                  bgcolor: "#b71c1c",
                  boxShadow: "0 6px 16px rgba(211, 47, 47, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {t("dashboard.manageReports")}
            </Button>
          </Box>

          {/* Driver Assignment Status */}
          {car.driver_id && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                backgroundColor: "rgba(0, 122, 255, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(0, 122, 255, 0.2)",
              }}
            >
              <Person sx={{ fontSize: 18, color: "#007AFF" }} />
              <Typography
                variant="body2"
                sx={{
                  color: "#007AFF",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
              >
                {t("dashboard.assigned")}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssignedOwnerCar;
