import { Assessment } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { Car } from "../types";

const DriverDashboard: React.FC = () => {
  const { profile } = useUserContext();
  const { t } = useTranslation();
  const [assignedCars, setAssignedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Load assigned cars
      const carsData = await carService.getCarsByDriver(profile.id);
      setAssignedCars(carsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Driver Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              View your assigned cars and access reports for each vehicle.
            </Typography>
          </Paper>
        </Grid>

        {/* Assigned Cars Section */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Assigned Cars
            </Typography>
            {assignedCars.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No cars assigned to you yet. Contact an owner to get assigned
                  to a vehicle.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {assignedCars.map((car) => (
                  <Grid key={car.id} size={12}>
                    <Card elevation={1}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="h6" component="div">
                              {car.year} {car.make} {car.model}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                VIN: {car.vin}
                              </Typography>
                              {car.license_plate && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  License: {car.license_plate}
                                </Typography>
                              )}
                              {car.color && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Color: {car.color}
                                </Typography>
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              Current Mileage:{" "}
                              {car.current_mileage.toLocaleString()} KM
                            </Typography>
                          </Box>
                          <Chip
                            label={car.status}
                            color={
                              car.status === "available"
                                ? "success"
                                : car.status === "assigned"
                                ? "primary"
                                : car.status === "maintenance"
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                          }}
                        >
                          <Tooltip title={t("reports.title")}>
                            <IconButton
                              component={Link}
                              to={`/cars/${car.id}/reports`}
                              color="primary"
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                "&:hover": { bgcolor: "primary.dark" },
                              }}
                            >
                              <Assessment />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DriverDashboard;
