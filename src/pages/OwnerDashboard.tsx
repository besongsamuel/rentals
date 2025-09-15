import { Add, DirectionsCar, Settings, TrendingUp } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fab,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import CarList from "../components/CarList";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { Car } from "../types";
import CarManagement from "./CarManagement";

const OwnerDashboard: React.FC = () => {
  const { user } = useUserContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  const activeCars = cars.filter(
    (car) => car.status === "assigned" || car.status === "available"
  ).length;
  const totalCars = cars.length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2rem" },
            }}
          >
            {t("dashboard.ownerDashboard")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("dashboard.manageCars")}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <DirectionsCar
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totalCars}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.totalCars")}
              </Typography>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <TrendingUp sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {activeCars}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.activeCars")}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {t("cars.title")}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setCurrentView("management")}
                fullWidth={isMobile}
              >
                {t("dashboard.manageAssignments")}
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                component={Link}
                to="/cars/new"
                fullWidth={isMobile}
              >
                {t("cars.addCar")}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Cars List */}
        <CarList cars={cars} onRefresh={loadCars} />

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="add car"
            component={Link}
            to="/cars/new"
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
            }}
          >
            <Add />
          </Fab>
        )}
      </Container>
    </Box>
  );
};

export default OwnerDashboard;
