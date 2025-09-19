import {
  Add,
  Assignment,
  DirectionsCar,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AssignedOwnerCar from "../components/AssignedOwnerCar";
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
  const assignedCars = cars.filter((car) => car.status === "assigned").length;
  const totalCars = cars.length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
      <Box sx={{ py: { xs: 3, sm: 4 } }}>
        {/* Header Section */}
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
            {t("dashboard.ownerDashboard")}
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
            mb: 6,
          }}
        >
          <Card
            elevation={0}
            sx={{
              background: "#ffffff",
              border: "0.5px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <DirectionsCar sx={{ fontSize: 40, color: "#007AFF", mb: 2 }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 400,
                  mb: 1,
                  color: "#1D1D1F",
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                  letterSpacing: "-0.02em",
                }}
              >
                {totalCars}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontWeight: 400,
                  color: "#86868B",
                  fontSize: "0.875rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {t("dashboard.totalCars")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                component={Link}
                to="/cars/new"
                sx={{
                  minWidth: "fit-content",
                  backgroundColor: "#007AFF",
                  "&:hover": {
                    backgroundColor: "#0056CC",
                  },
                }}
              >
                {t("cars.addCar")}
              </Button>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              background: "#ffffff",
              border: "0.5px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <TrendingUp sx={{ fontSize: 40, color: "#34C759", mb: 2 }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 400,
                  mb: 1,
                  color: "#1D1D1F",
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                  letterSpacing: "-0.02em",
                }}
              >
                {activeCars}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 400,
                  color: "#86868B",
                  fontSize: "0.875rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {t("dashboard.activeCars")}
              </Typography>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              background: "#ffffff",
              border: "0.5px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Assignment sx={{ fontSize: 40, color: "#FF9500", mb: 2 }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 400,
                  mb: 1,
                  color: "#1D1D1F",
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                  letterSpacing: "-0.02em",
                }}
              >
                {assignedCars}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 400,
                  color: "#86868B",
                  fontSize: "0.875rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {t("dashboard.assignedCars")}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Cars List */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 400,
              color: "#1D1D1F",
              letterSpacing: "-0.01em",
            }}
          >
            {t("dashboard.myCars")}
          </Typography>

          {cars.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <DirectionsCar sx={{ fontSize: 64, color: "#86868B", mb: 2 }} />
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 400,
                  color: "#1D1D1F",
                }}
              >
                {t("cars.noCars")}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t("dashboard.noCarsMessage")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                component={Link}
                to="/cars/new"
                sx={{
                  backgroundColor: "#007AFF",
                  "&:hover": {
                    backgroundColor: "#0056CC",
                  },
                }}
              >
                {t("cars.addCar")}
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {cars.map((car) => (
                <Grid key={car.id} size={12}>
                  <AssignedOwnerCar car={car} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Fab
            aria-label="add car"
            component={Link}
            to="/cars/new"
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              backgroundColor: "#007AFF",
              "&:hover": {
                backgroundColor: "#0056CC",
              },
            }}
          >
            <Add />
          </Fab>
        )}
      </Box>
    </Box>
  );
};

export default OwnerDashboard;
