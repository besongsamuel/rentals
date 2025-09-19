import {
  Assessment,
  CalendarToday,
  ConfirmationNumber,
  DirectionsCar,
  LocalGasStation,
  Palette,
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
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Car } from "../types";

interface AssignedCarProps {
  car: Car;
}

const AssignedCar: React.FC<AssignedCarProps> = ({ car }) => {
  const { t } = useTranslation();

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
        height: "100%",
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
      <CardContent sx={{ p: 3 }}>
        {/* Header with Car Title and Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: "bold",
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
                mb: 1,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              {car.year} {car.make} {car.model}
            </Typography>
            <Chip
              label={car.status.charAt(0).toUpperCase() + car.status.slice(1)}
              color={getStatusColor(car.status) as any}
              size="small"
              sx={{
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          </Box>
        </Box>

        {/* Car Details Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* VIN */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ConfirmationNumber
                sx={{
                  mr: 1,
                  fontSize: 18,
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <DirectionsCar
                  sx={{
                    mr: 1,
                    fontSize: 18,
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Palette
                  sx={{
                    mr: 1,
                    fontSize: 18,
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarToday
                sx={{
                  mr: 1,
                  fontSize: 18,
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Speed
                sx={{
                  mr: 1,
                  fontSize: 18,
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
              {car.current_mileage.toLocaleString()} {t("dashboard.km")}
            </Typography>
          </Grid>

          {/* Initial Mileage */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Speed
                sx={{
                  mr: 1,
                  fontSize: 18,
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocalGasStation
                  sx={{
                    mr: 1,
                    fontSize: 18,
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Settings
                  sx={{
                    mr: 1,
                    fontSize: 18,
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
        </Grid>

        {/* Action Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 2,
            borderTop: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <Button
            component={Link}
            to={`/cars/${car.id}`}
            variant="contained"
            startIcon={<Assessment />}
            sx={{
              bgcolor: "#d32f2f",
              color: "white",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
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
      </CardContent>
    </Card>
  );
};

export default AssignedCar;
