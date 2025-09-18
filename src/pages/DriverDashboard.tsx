import {
  Assessment,
  Email,
  LocationOn,
  Person,
  Phone,
  School,
  Work,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
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
import { driverDetailsService } from "../services/driverDetailsService";
import { Car, DriverDetails } from "../types";

const DriverDashboard: React.FC = () => {
  const { profile } = useUserContext();
  const { t } = useTranslation();
  const [assignedCars, setAssignedCars] = useState<Car[]>([]);
  const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(
    null
  );
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

      // Load driver details
      const detailsData = await driverDetailsService.getDriverDetails(
        profile.id
      );
      setDriverDetails(detailsData);
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
          {t("dashboard.driverDashboard")}
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
          {t("dashboard.driverDashboardDescription")}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Summary Section */}
        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: "#ffffff",
              border: "0.5px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 400,
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              {t("dashboard.profileSummary")}
            </Typography>

            <Grid container spacing={3}>
              {/* Basic Profile Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    background: "#ffffff",
                    border: "0.5px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Avatar sx={{ bgcolor: "#007AFF", mr: 2 }}>
                        <Person />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 400,
                          color: "#1D1D1F",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {t("dashboard.basicInformation")}
                      </Typography>
                    </Box>

                    <Box sx={{ pl: 7 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Person
                          sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {t("dashboard.name")}:{" "}
                          <strong>
                            {profile?.full_name || t("dashboard.notProvided")}
                          </strong>
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Email
                          sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {t("dashboard.email")}:{" "}
                          <strong>
                            {profile?.email || t("dashboard.notProvided")}
                          </strong>
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Phone
                          sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {t("dashboard.phone")}:{" "}
                          <strong>
                            {profile?.phone || t("dashboard.notProvided")}
                          </strong>
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Work
                          sx={{ mr: 1, fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {t("dashboard.role")}:{" "}
                          <strong>
                            {profile?.user_type
                              ? profile.user_type.charAt(0).toUpperCase() +
                                profile.user_type.slice(1)
                              : t("profile.driver")}
                          </strong>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Driver Details Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={1} sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
                        <School />
                      </Avatar>
                      <Typography variant="h6">
                        {t("dashboard.driverDetails")}
                      </Typography>
                    </Box>

                    <Box sx={{ pl: 7 }}>
                      {driverDetails ? (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Work
                              sx={{
                                mr: 1,
                                fontSize: 16,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {t("dashboard.experience")}:{" "}
                              <strong>
                                {driverDetails.years_of_experience || 0}{" "}
                                {t("dashboard.years")}
                              </strong>
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <School
                              sx={{
                                mr: 1,
                                fontSize: 16,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {t("dashboard.licenseNumber")}:{" "}
                              <strong>
                                {driverDetails.license_number ||
                                  t("dashboard.notProvided")}
                              </strong>
                            </Typography>
                          </Box>

                          {driverDetails.languages &&
                            driverDetails.languages.length > 0 && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mr: 1 }}
                                >
                                  Languages:
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                  }}
                                >
                                  {driverDetails.languages.map(
                                    (lang, index) => (
                                      <Chip
                                        key={index}
                                        label={lang}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )
                                  )}
                                </Box>
                              </Box>
                            )}

                          {driverDetails.city && (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <LocationOn
                                sx={{
                                  mr: 1,
                                  fontSize: 16,
                                  color: "text.secondary",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Location:{" "}
                                <strong>
                                  {driverDetails.city}
                                  {driverDetails.state_province
                                    ? `, ${driverDetails.state_province}`
                                    : ""}
                                </strong>
                              </Typography>
                            </Box>
                          )}
                        </>
                      ) : (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {t("dashboard.driverDetailsNotCompleted")}
                          </Typography>
                          <Chip
                            label={t("dashboard.completeProfile")}
                            color="primary"
                            component={Link}
                            to="/profile"
                            clickable
                            sx={{ textDecoration: "none" }}
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

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
                                {t("dashboard.vin")}: {car.vin}
                              </Typography>
                              {car.license_plate && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("dashboard.license")}: {car.license_plate}
                                </Typography>
                              )}
                              {car.color && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("dashboard.color")}: {car.color}
                                </Typography>
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {t("dashboard.currentMileage")}:{" "}
                              {car.current_mileage.toLocaleString()}{" "}
                              {t("dashboard.km")}
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
                              to={`/cars/${car.id}`}
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
    </Box>
  );
};

export default DriverDashboard;
