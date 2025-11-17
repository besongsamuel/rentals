import {
  ArrowBack,
  Assignment,
  CheckCircle,
  DirectionsCar,
  Email,
  Language,
  LocalShipping,
  LocationOn,
  Phone,
  Public,
  Verified,
  WorkspacePremium,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { driverDetailsService } from "../services/driverDetailsService";
import { Car, DriverDetailsWithProfile } from "../types";

const DriverDetails: React.FC = () => {
  const { user, profile } = useUserContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { driverId } = useParams<{ driverId: string }>();

  const [driver, setDriver] = useState<DriverDetailsWithProfile | null>(null);
  const [ownerCars, setOwnerCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not an owner
  useEffect(() => {
    if (user && profile && profile.user_type !== "owner") {
      navigate("/");
    }
  }, [user, profile, navigate]);

  // Fetch driver details and owner's cars
  useEffect(() => {
    const fetchData = async () => {
      if (!driverId || !profile || profile.user_type !== "owner") return;

      try {
        setLoading(true);

        // Fetch driver details
        const driverDetails =
          await driverDetailsService.getDriverDetailsWithProfile(driverId);
        if (!driverDetails) {
          setError("Driver not found");
          return;
        }
        setDriver(driverDetails);

        // Fetch owner's available cars
        const cars = await carService.getCarsByOwner(profile.id);
        const availableCars = cars.filter((car) => car.status === "available");
        setOwnerCars(availableCars);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load driver details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [driverId, profile]);

  const handleAssignCar = async (carId: string) => {
    if (!driver || !profile) return;

    try {
      setAssigning(true);
      await carService.assignCarToDriver(carId, driver.profile_id, profile.id);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error("Error assigning car:", err);
      setError("Failed to assign car. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "busy":
        return "warning";
      case "on_break":
        return "info";
      case "unavailable":
        return "error";
      default:
        return "default";
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case "available":
        return t("driverSearch.availability.available");
      case "busy":
        return t("driverSearch.availability.busy");
      case "on_break":
        return t("driverSearch.availability.onBreak");
      case "unavailable":
        return t("driverSearch.availability.unavailable");
      default:
        return status;
    }
  };

  const formatExperience = (years: number) => {
    if (years === 0) return t("driverSearch.experience.newDriver");
    if (years === 1) return t("driverSearch.experience.oneYear");
    return t("driverSearch.experience.years", { count: years });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("driverDetails.notSpecified");
    return new Date(dateString).toLocaleDateString();
  };

  const isExperienced = driver && driver.years_of_experience >= 3;
  const isAvailable = driver && driver.availability_status === "available";

  if (!user || profile?.user_type !== "owner") {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
          <SkeletonLoader />
        </Container>
      </Box>
    );
  }

  if (error || !driver) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226, 232, 240, 0.3)",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              {error || t("driverDetails.driverNotFound")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/drivers")}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1b5e20 0%, #b71c1c 100%)",
                },
              }}
            >
              {t("driverDetails.backToDrivers")}
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <IconButton
              onClick={() => navigate("/drivers")}
              sx={{
                mr: 2,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem" },
                background: "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("driverDetails.title")}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Driver Information */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              elevation={0}
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(226, 232, 240, 0.3)",
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Driver Header */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 96,
                        height: 96,
                        mr: 3,
                        background: isAvailable
                          ? "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)"
                          : "linear-gradient(135deg, #757575 0%, #bdbdbd 100%)",
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      }}
                    >
                      {driver.profiles?.full_name?.charAt(0) || "D"}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "1.5rem", sm: "2rem" },
                          }}
                        >
                          {driver.profiles?.full_name || t("driverDetails.unknownDriver")}
                        </Typography>
                        {isExperienced && (
                          <WorkspacePremium
                            sx={{ fontSize: 28, color: "#f57c00" }}
                            titleAccess={t("driverSearch.experiencedDriver")}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={getAvailabilityText(driver.availability_status)}
                          color={
                            getAvailabilityColor(driver.availability_status) as any
                          }
                          icon={
                            isAvailable ? (
                              <CheckCircle sx={{ fontSize: 18 }} />
                            ) : undefined
                          }
                          sx={{
                            fontSize: "0.875rem",
                            height: 32,
                            fontWeight: 600,
                          }}
                        />
                        {driver.license_number && (
                          <Chip
                            icon={<Verified sx={{ fontSize: 18 }} />}
                            label={t("driverDetails.verified")}
                            size="small"
                            sx={{
                              height: 32,
                              fontWeight: 600,
                              color: "primary.main",
                              borderColor: "primary.main",
                            }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Contact Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {t("driverDetails.contactInformation")}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "rgba(46, 125, 50, 0.05)",
                          borderRadius: 2,
                          border: "1px solid rgba(46, 125, 50, 0.1)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <Email sx={{ fontSize: 18, color: "primary.main", mr: 1 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                            {t("driverDetails.email")}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {driver.profiles?.email || t("driverDetails.notProvided")}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "rgba(46, 125, 50, 0.05)",
                          borderRadius: 2,
                          border: "1px solid rgba(46, 125, 50, 0.1)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <Phone sx={{ fontSize: 18, color: "primary.main", mr: 1 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}>
                            {t("driverDetails.phone")}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {driver.profiles?.phone || t("driverDetails.notProvided")}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Location Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      color: "text.primary",
                    }}
                  >
                    {t("driverDetails.location")}
                  </Typography>
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: "rgba(46, 125, 50, 0.05)",
                      borderRadius: 2,
                      border: "1px solid rgba(46, 125, 50, 0.1)",
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    <LocationOn sx={{ fontSize: 24, color: "primary.main", mr: 2, mt: 0.25 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {driver.address && `${driver.address}, `}
                        {driver.city && driver.state_province
                          ? `${driver.city}, ${driver.state_province}`
                          : driver.city ||
                            driver.state_province ||
                            t("driverSearch.locationNotSpecified")}
                        {driver.postal_code && ` ${driver.postal_code}`}
                      </Typography>
                      {driver.country && (
                        <Chip
                          icon={<Public />}
                          label={driver.country}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1, height: 24 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Driving Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      color: "text.primary",
                    }}
                  >
                    {t("driverDetails.drivingInformation")}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: isExperienced ? "rgba(46, 125, 50, 0.1)" : "rgba(0, 0, 0, 0.03)",
                          borderRadius: 2,
                          border: `1px solid ${isExperienced ? "rgba(46, 125, 50, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <DirectionsCar
                          sx={{
                            fontSize: 24,
                            color: isExperienced ? "primary.main" : "text.secondary",
                          }}
                        />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.25 }}>
                            {t("driverSearch.drivingExperience")}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatExperience(driver.years_of_experience)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: 2,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <LocalShipping
                          sx={{
                            fontSize: 24,
                            color: "text.secondary",
                          }}
                        />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.25 }}>
                            {t("driverSearch.transmissionPreference")}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {driver.preferred_transmission || t("driverDetails.any")}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* License Information */}
                {driver.license_number && (
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2.5,
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Verified sx={{ color: "primary.main" }} />
                      {t("driverDetails.licenseInformation")}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.5 }}>
                            {t("driverDetails.licenseNumber")}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {driver.license_number}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.5 }}>
                            {t("driverDetails.class")}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {driver.license_class || t("driverDetails.notSpecified")}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.5 }}>
                            {t("driverDetails.issued")}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDate(driver.license_issue_date)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.5 }}>
                            {t("driverDetails.expires")}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDate(driver.license_expiry_date)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Additional Information */}
                {(driver.languages || driver.nationality) && (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2.5,
                        color: "text.primary",
                      }}
                    >
                      {t("driverDetails.additionalInformation")}
                    </Typography>
                    <Grid container spacing={2}>
                      {driver.nationality && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "rgba(0, 0, 0, 0.03)",
                              borderRadius: 2,
                              border: "1px solid rgba(0, 0, 0, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Public sx={{ fontSize: 24, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.25 }}>
                                {t("driverDetails.nationality")}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {driver.nationality}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {driver.languages && driver.languages.length > 0 && (
                        <Grid size={{ xs: 12, sm: driver.nationality ? 6 : 12 }}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "rgba(0, 0, 0, 0.03)",
                              borderRadius: 2,
                              border: "1px solid rgba(0, 0, 0, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Language sx={{ fontSize: 24, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", display: "block", mb: 0.25 }}>
                                {t("driverDetails.languages")}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                                {driver.languages.map((lang, index) => (
                                  <Chip
                                    key={index}
                                    label={lang}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: "0.75rem" }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Car Assignment */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(226, 232, 240, 0.3)",
                borderRadius: 3,
                position: "sticky",
                top: 20,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2.5,
                    color: "text.primary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Assignment sx={{ mr: 1 }} />
                  {t("driverDetails.assignVehicle")}
                </Typography>

                {ownerCars.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <DirectionsCar
                      sx={{
                        fontSize: 56,
                        color: "text.secondary",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, fontWeight: 500 }}
                    >
                      {t("driverDetails.noAvailableVehicles")}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/cars/new")}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)",
                        },
                      }}
                    >
                      {t("driverDetails.addVehicle")}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2.5, fontWeight: 500 }}
                    >
                      {t("driverDetails.selectVehicleToAssign")}
                    </Typography>
                    {ownerCars.map((car) => (
                      <Paper
                        key={car.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: "1px solid rgba(226, 232, 240, 0.5)",
                          borderRadius: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {car.year} {car.make} {car.model}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          VIN: {car.vin}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {car.fuel_type} • {car.transmission_type}
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleAssignCar(car.id)}
                          disabled={assigning}
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 600,
                            background:
                              "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)",
                            },
                            "&:disabled": {
                              background: "rgba(0, 0, 0, 0.12)",
                            },
                          }}
                        >
                          {assigning ? t("driverDetails.assigning") : t("driverDetails.assignVehicle")}
                        </Button>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DriverDetails;
