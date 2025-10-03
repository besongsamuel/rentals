import {
  CalendarToday,
  ColorLens,
  DirectionsCar,
  DriveEta,
  LocalGasStation,
  Send,
  Settings,
  Speed,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Car } from "../types";
import DriveRequestDialog from "./DriveRequestDialog";
import VerificationBadge from "./VerificationBadge";

interface CarCardProps {
  car: Car;
  carImageUrl?: string | null;
  canSendRequest?: boolean;
  hasExistingRequest?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  carImageUrl,
  canSendRequest = false,
  hasExistingRequest = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return theme.palette.success.main;
      case "assigned":
        return theme.palette.info.main;
      case "maintenance":
        return theme.palette.warning.main;
      case "retired":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTransmissionIcon = () => {
    return <Settings sx={{ fontSize: 20 }} />;
  };

  const getFuelTypeIcon = () => {
    return <LocalGasStation sx={{ fontSize: 20 }} />;
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Car Image */}
      {carImageUrl ? (
        <Box
          component="img"
          src={carImageUrl}
          alt={`${car.make} ${car.model}`}
          sx={{
            width: "100%",
            height: 200,
            objectFit: "contain",
            borderRadius: "12px 12px 0 0",
            bgcolor: "rgba(0, 0, 0, 0.02)",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <DirectionsCar sx={{ fontSize: 80, color: "text.disabled" }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Car Title */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1D1D1F",
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <DirectionsCar sx={{ color: theme.palette.primary.main }} />
            {car.make} {car.model}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={t(`cars.status.${car.status}`)}
              size="small"
              sx={{
                backgroundColor: `${getStatusColor(car.status)}15`,
                color: getStatusColor(car.status),
                fontWeight: 500,
                fontSize: "0.75rem",
              }}
            />
            <VerificationBadge
              isVerified={car.is_verified ?? false}
              type="car"
              size="small"
            />
          </Box>
        </Box>

        {/* Car Details Grid */}
        <Grid container spacing={2}>
          {/* Year */}
          <Grid size={{ xs: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarToday
                sx={{
                  mr: 1.5,
                  fontSize: 18,
                  color: "text.secondary",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("cars.year")}
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

          {/* Color */}
          {car.color && (
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ColorLens
                  sx={{
                    mr: 1.5,
                    fontSize: 18,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("cars.color")}
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
                {car.color}
              </Typography>
            </Grid>
          )}

          {/* Transmission Type */}
          {car.transmission_type && (
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {getTransmissionIcon()}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1.5 }}
                >
                  {t("cars.transmission")}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#1D1D1F",
                  fontSize: "0.875rem",
                  textTransform: "capitalize",
                }}
              >
                {t(`cars.transmissionType.${car.transmission_type}`)}
              </Typography>
            </Grid>
          )}

          {/* Fuel Type */}
          {car.fuel_type && (
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {getFuelTypeIcon()}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1.5 }}
                >
                  {t("cars.fuelType")}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#1D1D1F",
                  fontSize: "0.875rem",
                  textTransform: "capitalize",
                }}
              >
                {t(`cars.fuel.${car.fuel_type}`)}
              </Typography>
            </Grid>
          )}

          {/* Current Mileage */}
          <Grid size={{ xs: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Speed
                sx={{
                  mr: 1.5,
                  fontSize: 18,
                  color: "text.secondary",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {t("cars.currentMileage")}
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
              {car.current_mileage.toLocaleString()} km
            </Typography>
          </Grid>

          {/* License Plate */}
          {car.license_plate && (
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <DriveEta
                  sx={{
                    mr: 1.5,
                    fontSize: 18,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("cars.licensePlate")}
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
        </Grid>
      </CardContent>

      {/* Request to Drive Button */}
      {canSendRequest && car.status === "available" && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Send />}
            onClick={() => setShowRequestDialog(true)}
            disabled={hasExistingRequest}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "white",
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            {hasExistingRequest
              ? t("driveRequests.requestSent")
              : t("driveRequests.requestToDrive")}
          </Button>
        </CardActions>
      )}

      {/* Drive Request Dialog */}
      <DriveRequestDialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        car={car}
      />
    </Card>
  );
};

export default CarCard;
