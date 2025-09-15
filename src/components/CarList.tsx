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

interface CarListProps {
  cars: Car[];
  onRefresh: () => void;
}

const CarList: React.FC<CarListProps> = ({ cars, onRefresh }) => {
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        My Cars ({cars.length})
      </Typography>
      <Grid container spacing={2}>
        {cars.map((car) => (
          <Grid key={car.id} size={12}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {car.year} {car.make} {car.model}
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        VIN: {car.vin}
                      </Typography>

                      {car.license_plate && (
                        <Typography variant="body2" color="text.secondary">
                          License: {car.license_plate}
                        </Typography>
                      )}

                      {car.color && (
                        <Typography variant="body2" color="text.secondary">
                          Color: {car.color}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t("cars.currentMileage")}:{" "}
                      {car.current_mileage.toLocaleString()} {t("common.km")}
                    </Typography>

                    {car.driver_id && (
                      <Typography variant="body2" color="primary" gutterBottom>
                        {t("cars.assigned")}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={car.status}
                      color={getStatusColor(car.status) as any}
                      size="small"
                    />

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/cars/${car.id}/reports`}
                      >
                        {t("cars.viewReports")}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/cars/${car.id}/edit`}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/cars/${car.id}`}
                      >
                        {t("cars.manage")}
                      </Button>
                    </Box>
                  </Box>
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
