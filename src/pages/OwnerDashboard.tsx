import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CarList from "../components/CarList";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { Car } from "../types";
import CarManagement from "./CarManagement";

const OwnerDashboard: React.FC = () => {
  const { user } = useUserContext();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"cars" | "management">("cars");

  const loadCars = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const carsData = await carService.getCarsByOwner(user.id);
      setCars(carsData);
    } catch (error) {
      console.error("Error loading cars:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadCars();
    }
  }, [user?.id, loadCars]);

  if (loading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  if (currentView === "management") {
    return <CarManagement onBack={() => setCurrentView("cars")} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h4" gutterBottom>
                Owner Dashboard - Car Management
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentView("management")}
                >
                  Manage Assignments
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/cars/new"
                >
                  Add New Car
                </Button>
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              Manage your fleet of vehicles, assign drivers, and track weekly
              reports.
            </Typography>
          </Paper>
        </Grid>

        <Grid size={12}>
          <CarList cars={cars} onRefresh={loadCars} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default OwnerDashboard;
