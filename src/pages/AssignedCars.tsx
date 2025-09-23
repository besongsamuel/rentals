import { Box, Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AssignedCar from "../components/AssignedCar";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { Car } from "../types";

const AssignedCars: React.FC = () => {
  const { profile } = useUserContext();
  const { t } = useTranslation();
  const [assignedCars, setAssignedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignedCars = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Load assigned cars
      const carsData = await carService.getCarsByDriver(profile.id);
      setAssignedCars(carsData);
    } catch (error) {
      console.error("Error loading assigned cars:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      loadAssignedCars();
    }
  }, [profile?.id, loadAssignedCars]);

  if (loading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  return (
    <Box sx={{ py: { xs: 3, sm: 4 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 400,
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: "#1D1D1F",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {t("dashboard.assignedCars")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            color: "#86868B",
            fontSize: { xs: "1rem", sm: "1.125rem" },
            letterSpacing: "-0.01em",
          }}
        >
          {t("dashboard.assignedCarsDescription")}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Assigned Cars Section */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t("dashboard.assignedCars")}
            </Typography>
            {assignedCars.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {t("dashboard.noAssignedCarsMessage")}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {assignedCars.map((car) => (
                  <Grid key={car.id} size={12}>
                    <AssignedCar car={car} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssignedCars;
