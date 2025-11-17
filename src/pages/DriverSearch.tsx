import {
  CheckCircle,
  DirectionsCar,
  LocalShipping,
  LocationOn,
  Person,
  Search,
  Verified,
  Visibility,
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
  InputAdornment,
  Pagination,
  Paper,
  TextField,
  Typography,
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

  const [drivers, setDrivers] = useState<DriverDetailsWithProfile[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<
    DriverDetailsWithProfile[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid on desktop

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
      setCurrentPage(1);
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
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, drivers]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // Driver Card Component
  const DriverCard: React.FC<{ driver: DriverDetailsWithProfile }> = ({
    driver,
  }) => {
    const isExperienced = driver.years_of_experience >= 3;
    const isAvailable = driver.availability_status === "available";

    return (
      <Card
        elevation={0}
        sx={{
          height: "100%",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: isAvailable
            ? "2px solid rgba(46, 125, 50, 0.3)"
            : "1px solid rgba(226, 232, 240, 0.3)",
          borderRadius: 3,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: isAvailable
              ? "0 12px 40px rgba(46, 125, 50, 0.15)"
              : "0 12px 40px rgba(0, 0, 0, 0.1)",
            border: isAvailable
              ? "2px solid rgba(46, 125, 50, 0.5)"
              : "1px solid rgba(46, 125, 50, 0.3)",
          },
        }}
      >
        <CardContent sx={{ p: 3, height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Header Section */}
            <Box sx={{ mb: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 2,
                    background: isAvailable
                      ? "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)"
                      : "linear-gradient(135deg, #757575 0%, #bdbdbd 100%)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  {driver.profiles?.full_name?.charAt(0) || "D"}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "text.primary",
                      }}
                    >
                      {driver.profiles?.full_name || "Unknown Driver"}
                    </Typography>
                    {isExperienced && (
                      <WorkspacePremium
                        sx={{
                          fontSize: 20,
                          color: "#f57c00",
                        }}
                        titleAccess={t("driverSearch.experiencedDriver")}
                      />
                    )}
                  </Box>
                  <Chip
                    label={getAvailabilityText(driver.availability_status)}
                    size="small"
                    color={
                      getAvailabilityColor(driver.availability_status) as any
                    }
                    icon={
                      isAvailable ? (
                        <CheckCircle sx={{ fontSize: 16 }} />
                      ) : undefined
                    }
                    sx={{
                      fontSize: "0.75rem",
                      height: 26,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              {/* Location */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  bgcolor: "rgba(46, 125, 50, 0.05)",
                  borderRadius: 2,
                }}
              >
                <LocationOn sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "text.primary" }}
                >
                  {driver.city && driver.state_province
                    ? `${driver.city}, ${driver.state_province}`
                    : driver.city ||
                      driver.state_province ||
                      t("driverSearch.locationNotSpecified")}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Key Highlights */}
            <Box sx={{ mb: 2.5, flexGrow: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  mb: 1.5,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {t("driverSearch.keyHighlights")}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Experience */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1.5,
                      bgcolor: isExperienced
                        ? "rgba(46, 125, 50, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DirectionsCar
                      sx={{
                        fontSize: 20,
                        color: isExperienced
                          ? "primary.main"
                          : "text.secondary",
                      }}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      {formatExperience(driver.years_of_experience)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("driverSearch.drivingExperience")}
                    </Typography>
                  </Box>
                </Box>

                {/* Transmission Preference */}
                {driver.preferred_transmission && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LocalShipping
                        sx={{ fontSize: 20, color: "text.secondary" }}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        {driver.preferred_transmission}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("driverSearch.transmissionPreference")}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* License Verified */}
                {driver.license_number && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        bgcolor: "rgba(46, 125, 50, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Verified sx={{ fontSize: 20, color: "primary.main" }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        {t("driverSearch.licensedDriver")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("driverSearch.verifiedCredentials")}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Action Button */}
            <Button
              fullWidth
              variant="contained"
              endIcon={<Visibility />}
              onClick={() => handleViewDriver(driver.profile_id)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                background: isAvailable
                  ? "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)"
                  : "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
                "&:hover": {
                  background: isAvailable
                    ? "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)"
                    : "linear-gradient(135deg, #616161 0%, #757575 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: isAvailable
                    ? "0 6px 20px rgba(46, 125, 50, 0.3)"
                    : "0 6px 20px rgba(0, 0, 0, 0.2)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {t("driverSearch.viewProfile")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
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
            {t("driverSearch.title")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {t("driverSearch.subtitle")}
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
            placeholder={t("driverSearch.searchPlaceholder")}
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
                    height: "100%",
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
              {t("common.tryAgain")}
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
              {searchTerm
                ? t("driverSearch.noDriversFound")
                : t("driverSearch.noDriversAvailable")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? t("driverSearch.adjustSearchCriteria")
                : t("driverSearch.checkBackLater")}
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Results Count */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("driverSearch.resultsFound", {
                  count: filteredDrivers.length,
                })}
              </Typography>
              {totalPages > 1 && (
                <Typography variant="body2" color="text.secondary">
                  {t("driverSearch.pageInfo", {
                    current: currentPage,
                    total: totalPages,
                  })}
                </Typography>
              )}
            </Box>

            {/* Drivers Grid */}
            <Grid container spacing={3}>
              {paginatedDrivers.map((driver) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={driver.id}>
                  <DriverCard driver={driver} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontSize: "1rem",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default DriverSearch;
