import {
  ArrowBack,
  Assignment,
  DirectionsCar,
  Email,
  LocationOn,
  Phone,
  Star,
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
  useTheme,
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
  const theme = useTheme();

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
        return "Available";
      case "busy":
        return "Busy";
      case "on_break":
        return "On Break";
      case "unavailable":
        return "Unavailable";
      default:
        return status;
    }
  };

  const formatExperience = (years: number) => {
    if (years === 0) return "New Driver";
    if (years === 1) return "1 year experience";
    return `${years} years experience`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

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
              {error || "Driver not found"}
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
              Back to Drivers
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
              Driver Details
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mr: 3,
                      background:
                        "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                      fontSize: "2rem",
                      fontWeight: 700,
                    }}
                  >
                    {driver.profiles?.full_name?.charAt(0) || "D"}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                      }}
                    >
                      {driver.profiles?.full_name || "Unknown Driver"}
                    </Typography>
                    <Chip
                      label={getAvailabilityText(driver.availability_status)}
                      color={
                        getAvailabilityColor(driver.availability_status) as any
                      }
                      sx={{
                        fontSize: "0.875rem",
                        height: 32,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Contact Information */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "primary.main",
                    }}
                  >
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Email
                          sx={{
                            fontSize: 20,
                            color: "text.secondary",
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {driver.profiles?.email || "Not provided"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Phone
                          sx={{
                            fontSize: 20,
                            color: "text.secondary",
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {driver.profiles?.phone || "Not provided"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Location Information */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "primary.main",
                    }}
                  >
                    Location
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <LocationOn
                      sx={{
                        fontSize: 20,
                        color: "text.secondary",
                        mr: 1.5,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {driver.address && `${driver.address}, `}
                      {driver.city && driver.state_province
                        ? `${driver.city}, ${driver.state_province}`
                        : driver.city ||
                          driver.state_province ||
                          "Location not specified"}
                      {driver.postal_code && ` ${driver.postal_code}`}
                      {driver.country && `, ${driver.country}`}
                    </Typography>
                  </Box>
                </Box>

                {/* Driving Information */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: "primary.main",
                    }}
                  >
                    Driving Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <DirectionsCar
                          sx={{
                            fontSize: 20,
                            color: "text.secondary",
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {formatExperience(driver.years_of_experience)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Star
                          sx={{
                            fontSize: 20,
                            color: "text.secondary",
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Prefers {driver.preferred_transmission || "any"}{" "}
                          transmission
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* License Information */}
                {driver.license_number && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "primary.main",
                      }}
                    >
                      License Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          License Number: {driver.license_number}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Class: {driver.license_class || "Not specified"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Issued: {formatDate(driver.license_issue_date)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          Expires: {formatDate(driver.license_expiry_date)}
                        </Typography>
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
                        fontWeight: 600,
                        mb: 2,
                        color: "primary.main",
                      }}
                    >
                      Additional Information
                    </Typography>
                    {driver.nationality && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Nationality: {driver.nationality}
                      </Typography>
                    )}
                    {driver.languages && driver.languages.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Languages: {driver.languages.join(", ")}
                      </Typography>
                    )}
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
                    fontWeight: 600,
                    mb: 2,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Assignment sx={{ mr: 1 }} />
                  Assign Vehicle
                </Typography>

                {ownerCars.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <DirectionsCar
                      sx={{
                        fontSize: 48,
                        color: "text.secondary",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      No available vehicles to assign
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/cars/new")}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        borderColor: "primary.main",
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                    >
                      Add Vehicle
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Select a vehicle to assign to this driver:
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
                            py: 1,
                            background:
                              "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #1b5e20 0%, #b71c1c 100%)",
                            },
                            "&:disabled": {
                              background: "rgba(0, 0, 0, 0.12)",
                            },
                          }}
                        >
                          {assigning ? "Assigning..." : "Assign Vehicle"}
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
