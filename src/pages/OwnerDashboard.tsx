import { Add, DirectionsCar, TrendingUp } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fab,
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

const OwnerDashboard: React.FC = () => {
  const { user } = useUserContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

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
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              color: "text.primary",
            }}
          >
            {t("dashboard.ownerDashboard")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
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
            sx={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <DirectionsCar
                sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
              />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 0.5, color: "primary.main" }}
              >
                {totalCars}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                {t("dashboard.totalCars")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                component={Link}
                to="/cars/new"
                size="small"
                sx={{ minWidth: "fit-content" }}
              >
                {t("cars.addCar")}
              </Button>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(145deg, #ffffff 0%, #e8f5e8 100%)",
              border: "2px solid",
              borderColor: "success.main",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #4caf50 0%, #81c784 100%)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <TrendingUp sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 0.5, color: "success.main" }}
              >
                {activeCars}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {t("dashboard.activeCars")}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Cars Section Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {t("cars.title")}
          </Typography>
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
