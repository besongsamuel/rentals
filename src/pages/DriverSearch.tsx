import {
  DirectionsCar,
  LocationOn,
  Person,
  Search,
  Star,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { driverDetailsService } from "../services/driverDetailsService";
import { DriverDetailsWithProfile } from "../types";

const DriverSearch: React.FC = () => {
  const { user, profile } = useUserContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [drivers, setDrivers] = useState<DriverDetailsWithProfile[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<
    DriverDetailsWithProfile[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Redirect if not an owner
  useEffect(() => {
    if (user && profile && profile.user_type !== "owner") {
      navigate("/");
    }
  }, [user, profile, navigate]);

  // Fetch all available drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const availableDrivers =
          await driverDetailsService.getAvailableDrivers();
        setDrivers(availableDrivers);
        setFilteredDrivers(availableDrivers);
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setError("Failed to load drivers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (profile?.user_type === "owner") {
      fetchDrivers();
    }
  }, [profile]);

  // Filter drivers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDrivers(drivers);
      return;
    }

    const filtered = drivers.filter((driver) => {
      const fullName = driver.profiles?.full_name?.toLowerCase() || "";
      const city = driver.city?.toLowerCase() || "";
      const state = driver.state_province?.toLowerCase() || "";
      const licenseNumber = driver.license_number?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      return (
        fullName.includes(search) ||
        city.includes(search) ||
        state.includes(search) ||
        licenseNumber.includes(search)
      );
    });

    setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);

  const handleViewDriver = (driverId: string) => {
    navigate(`/drivers/${driverId}`);
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

  if (!user || profile?.user_type !== "owner") {
    return null;
  }

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
              background: "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Find Drivers
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Search and connect with qualified drivers for your vehicles
          </Typography>
        </Box>

        {/* Search Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(226, 232, 240, 0.3)",
            borderRadius: 3,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, city, state, or license number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
                "&.Mui-focused": {
                  backgroundColor: "rgba(255, 255, 255, 1)",
                },
              },
            }}
          />
        </Paper>

        {/* Results Section */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(226, 232, 240, 0.3)",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <SkeletonLoader />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
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
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
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
              Try Again
            </Button>
          </Paper>
        ) : filteredDrivers.length === 0 ? (
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
            <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {searchTerm ? "No drivers found" : "No drivers available"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Check back later for available drivers"}
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Results Count */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredDrivers.length} driver
                {filteredDrivers.length !== 1 ? "s" : ""} found
              </Typography>
            </Box>

            {/* Drivers Grid */}
            <Grid container spacing={3}>
              {filteredDrivers.map((driver) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={driver.id}>
                  <Card
                    elevation={0}
                    sx={{
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(226, 232, 240, 0.3)",
                      borderRadius: 3,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        border: "1px solid rgba(46, 125, 50, 0.3)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Driver Header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            background:
                              "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                          }}
                        >
                          {driver.profiles?.full_name?.charAt(0) || "D"}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              mb: 0.5,
                              fontSize: "1.1rem",
                            }}
                          >
                            {driver.profiles?.full_name || "Unknown Driver"}
                          </Typography>
                          <Chip
                            label={getAvailabilityText(
                              driver.availability_status
                            )}
                            size="small"
                            color={
                              getAvailabilityColor(
                                driver.availability_status
                              ) as any
                            }
                            sx={{
                              fontSize: "0.75rem",
                              height: 24,
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Driver Details */}
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <LocationOn
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {driver.city && driver.state_province
                              ? `${driver.city}, ${driver.state_province}`
                              : driver.city ||
                                driver.state_province ||
                                "Location not specified"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <DirectionsCar
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatExperience(driver.years_of_experience)}
                          </Typography>
                        </Box>

                        {driver.preferred_transmission && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Star
                              sx={{
                                fontSize: 16,
                                color: "text.secondary",
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Prefers {driver.preferred_transmission}{" "}
                              transmission
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Action Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDriver(driver.profile_id)}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          background:
                            "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #1b5e20 0%, #b71c1c 100%)",
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default DriverSearch;
