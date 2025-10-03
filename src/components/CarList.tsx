import { Add, DirectionsCar, Edit, Settings } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { carImageService } from "../services/carImageService";
import { Car, CarImage } from "../types";

interface CarListProps {
  cars: Car[];
  onRefresh: () => void;
  showAddCarButton?: boolean;
}

interface CarListItemProps {
  car: Car;
  isMobile: boolean;
  showAddCarButton?: boolean;
  getStatusColor: (status: string) => string;
  t: any;
}

const CarListItem: React.FC<CarListItemProps> = ({
  car,
  isMobile,
  showAddCarButton,
  getStatusColor,
  t,
}) => {
  const [carImage, setCarImage] = useState<CarImage | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  // Load first car image
  useEffect(() => {
    const loadCarImage = async () => {
      try {
        setLoadingImage(true);
        const images = await carImageService.getCarImages(car.id);
        // Get primary image or first image
        const primaryImage = images.find((img) => img.is_primary) || images[0];
        setCarImage(primaryImage || null);
      } catch (error) {
        console.error("Error loading car image:", error);
        setCarImage(null);
      } finally {
        setLoadingImage(false);
      }
    };

    loadCarImage();
  }, [car.id]);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Car Image */}
      {loadingImage ? (
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            height: 200,
            borderRadius: "4px 4px 0 0",
          }}
        />
      ) : carImage ? (
        <Box
          component="img"
          src={carImage.image_url}
          alt={`${car.make} ${car.model}`}
          sx={{
            width: "100%",
            height: 200,
            objectFit: "contain",
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
          }}
        >
          <DirectionsCar sx={{ fontSize: 80, color: "text.disabled" }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            component="div"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: "1.1rem",
              lineHeight: 1.3,
            }}
          >
            {car.year} {car.make} {car.model}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={car.status}
              color={getStatusColor(car.status) as any}
              size="small"
              sx={{ textTransform: "capitalize" }}
            />
            {car.driver_id && (
              <Chip
                label={t("cars.assigned")}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </Box>

        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>VIN:</strong> {car.vin}
          </Typography>

          {car.license_plate && (
            <Typography variant="body2" color="text.secondary">
              <strong>License:</strong> {car.license_plate}
            </Typography>
          )}

          {car.color && (
            <Typography variant="body2" color="text.secondary">
              <strong>Color:</strong> {car.color}
            </Typography>
          )}

          {car.fuel_type && (
            <Typography variant="body2" color="text.secondary">
              <strong>Fuel:</strong>{" "}
              {car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1)}
            </Typography>
          )}

          {car.transmission_type && (
            <Typography variant="body2" color="text.secondary">
              <strong>Transmission:</strong>{" "}
              {car.transmission_type.charAt(0).toUpperCase() +
                car.transmission_type.slice(1)}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary">
            <strong>{t("cars.currentMileage")}:</strong>{" "}
            {car.current_mileage.toLocaleString()} {t("common.km")}
          </Typography>
        </Stack>

        <Box sx={{ mt: "auto" }}>
          {isMobile ? (
            <Stack direction="row" spacing={2} justifyContent="center">
              <IconButton
                component={Link}
                to={`/cars/${car.id}/edit`}
                color="primary"
                size="small"
                title={t("common.edit")}
              >
                <Edit />
              </IconButton>
              <IconButton
                component={Link}
                to={`/cars/${car.id}`}
                color="primary"
                size="small"
                title={t("cars.manage")}
              >
                <Settings />
              </IconButton>
            </Stack>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                size="small"
                variant="outlined"
                component={Link}
                to={`/cars/${car.id}/edit`}
                startIcon={<Edit />}
                sx={{ minWidth: "fit-content" }}
              >
                {t("common.edit")}
              </Button>
              <Button
                size="small"
                variant="contained"
                component={Link}
                to={`/cars/${car.id}`}
                startIcon={<Settings />}
                sx={{ minWidth: "fit-content" }}
              >
                {t("cars.manage")}
              </Button>
              {showAddCarButton && (
                <Button
                  size="small"
                  variant="contained"
                  component={Link}
                  to="/cars/new"
                  startIcon={<Add />}
                  sx={{ minWidth: "fit-content" }}
                >
                  {t("cars.addCar")}
                </Button>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const CarList: React.FC<CarListProps> = ({
  cars,
  onRefresh,
  showAddCarButton = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "assigned":
        return "primary";
      case "maintenance":
        return "warning";
      case "retired":
        return "error";
      default:
        return "default";
    }
  };

  if (cars.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          My Cars
        </Typography>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No cars found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your first car to get started
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {t("cars.title")} ({cars.length})
      </Typography>

      <Grid container spacing={3}>
        {cars.map((car) => (
          <Grid key={car.id} size={12}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {car.year} {car.make} {car.model}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={car.status}
                      color={getStatusColor(car.status) as any}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                    {car.driver_id && (
                      <Chip
                        label={t("cars.assigned")}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>

                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>VIN:</strong> {car.vin}
                  </Typography>

                  {car.license_plate && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>License:</strong> {car.license_plate}
                    </Typography>
                  )}

                  {car.color && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Color:</strong> {car.color}
                    </Typography>
                  )}

                  {car.fuel_type && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fuel:</strong>{" "}
                      {car.fuel_type.charAt(0).toUpperCase() +
                        car.fuel_type.slice(1)}
                    </Typography>
                  )}

                  {car.transmission_type && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Transmission:</strong>{" "}
                      {car.transmission_type.charAt(0).toUpperCase() +
                        car.transmission_type.slice(1)}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    <strong>{t("cars.currentMileage")}:</strong>{" "}
                    {car.current_mileage.toLocaleString()} {t("common.km")}
                  </Typography>
                </Stack>

                <Box sx={{ mt: "auto" }}>
                  {isMobile ? (
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <IconButton
                        component={Link}
                        to={`/cars/${car.id}/edit`}
                        color="primary"
                        size="small"
                        title={t("common.edit")}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        component={Link}
                        to={`/cars/${car.id}`}
                        color="primary"
                        size="small"
                        title={t("cars.manage")}
                      >
                        <Settings />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/cars/${car.id}/edit`}
                        startIcon={<Edit />}
                        sx={{ minWidth: "fit-content" }}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        component={Link}
                        to={`/cars/${car.id}`}
                        startIcon={<Settings />}
                        sx={{ minWidth: "fit-content" }}
                      >
                        {t("cars.manage")}
                      </Button>
                      {showAddCarButton && (
                        <Button
                          size="small"
                          variant="contained"
                          component={Link}
                          to="/cars/new"
                          startIcon={<Add />}
                          sx={{ minWidth: "fit-content" }}
                        >
                          {t("cars.addCar")}
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CarList;
