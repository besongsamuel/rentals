import { Add, Edit, Settings } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Car } from "../types";

interface CarListProps {
  cars: Car[];
  onRefresh: () => void;
  showAddCarButton?: boolean;
}

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
          <Grid key={car.id} size={{ xs: 12, sm: 6, lg: 4 }}>
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
