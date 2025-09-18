import {
  Analytics,
  Assessment,
  DirectionsCar,
  Star,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { profileService } from "../services/profileService";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userCounts, setUserCounts] = useState({ drivers: 0, owners: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const counts = await profileService.getUserCounts();
        setUserCounts(counts);
      } catch (error) {
        console.error("Error fetching user counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCounts();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f2f2f7",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Language Switcher */}
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <LanguageSwitcher />
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 3,
        }}
      >
        {/* Logo and Brand */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 6,
          }}
        >
          <Box
            component="img"
            src="/app_logo.png"
            alt="mo kumbi"
            sx={{
              height: 80,
              width: "auto",
              mb: 4,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textAlign: "center",
              mb: 1,
            }}
          >
            {t("auth.homeTitle")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "#86868b",
              letterSpacing: "-0.01em",
              textAlign: "center",
              textTransform: "lowercase",
              mb: 2,
            }}
          >
            {t("auth.homeSubtitle")}
          </Typography>
          <Box
            sx={{
              display: "inline-block",
              backgroundColor: "#34C759",
              color: "#ffffff",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            FREE
          </Box>

          {/* We dare to bring change section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 4,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                fontSize: "0.875rem",
                color: "#86868b",
                letterSpacing: "-0.01em",
              }}
            >
              {t("auth.dareWe")}
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                backgroundColor: "#6D6D70",
                color: "#ffffff",
                px: 1.5,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {t("auth.dareBadge")}
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                fontSize: "0.875rem",
                color: "#86868b",
                letterSpacing: "-0.01em",
              }}
            >
              {t("auth.dareToBringChange")}
            </Typography>
          </Box>
        </Box>

        {/* Service Description */}
        <Box sx={{ mb: 6, maxWidth: 600, textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
              mb: 3,
            }}
          >
            {t("auth.homeDescription")}
          </Typography>
        </Box>

        {/* Platform Goals Section */}
        <Box sx={{ mb: 6, maxWidth: 700, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.01em",
              mb: 3,
            }}
          >
            {t("auth.platformGoals")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1rem", sm: "1.125rem" },
              color: "#86868b",
              letterSpacing: "-0.01em",
              lineHeight: 1.6,
              p: 3,
              backgroundColor: "rgba(0, 122, 255, 0.05)",
              borderRadius: 2,
              border: "0.5px solid rgba(0, 122, 255, 0.1)",
            }}
          >
            {t("auth.platformGoalsDescription")}
          </Typography>
        </Box>

        {/* Free Platform Section */}
        <Box sx={{ mb: 6, maxWidth: 600, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.01em",
              mb: 3,
            }}
          >
            {t("auth.freePlatform")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1rem", sm: "1.125rem" },
              color: "#86868b",
              letterSpacing: "-0.01em",
              lineHeight: 1.6,
              p: 3,
              backgroundColor: "rgba(52, 199, 89, 0.05)",
              borderRadius: 2,
              border: "0.5px solid rgba(52, 199, 89, 0.1)",
            }}
          >
            {t("auth.freePlatformDescription")}
          </Typography>
        </Box>

        {/* User Statistics Section */}
        <Box sx={{ mb: 6, maxWidth: 500, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.01em",
              mb: 3,
            }}
          >
            {t("auth.userStats")}
          </Typography>
          <Grid container spacing={3} sx={{ maxWidth: 400, mx: "auto" }}>
            <Grid size={{ xs: 6 }}>
              <Card
                sx={{
                  background: "#ffffff",
                  border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 400,
                      fontSize: { xs: "2rem", sm: "2.5rem" },
                      color: "#007AFF",
                      letterSpacing: "-0.02em",
                      mb: 1,
                    }}
                  >
                    {loading ? "..." : userCounts.drivers}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#86868b",
                      fontSize: "0.875rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t("auth.driversCount")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Card
                sx={{
                  background: "#ffffff",
                  border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 400,
                      fontSize: { xs: "2rem", sm: "2.5rem" },
                      color: "#34C759",
                      letterSpacing: "-0.02em",
                      mb: 1,
                    }}
                  >
                    {loading ? "..." : userCounts.owners}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#86868b",
                      fontSize: "0.875rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t("auth.ownersCount")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ mb: 6, width: "100%" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.01em",
              textAlign: "center",
              mb: 4,
            }}
          >
            {t("auth.benefitsTitle")}
          </Typography>

          <Grid container spacing={3} sx={{ maxWidth: 800, mx: "auto" }}>
            {/* Track Progress Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  background: "#ffffff",
                  border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 122, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <Analytics sx={{ fontSize: 30, color: "#007AFF" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 400,
                      fontSize: "1.1rem",
                      color: "#1d1d1f",
                      letterSpacing: "-0.01em",
                      mb: 1,
                    }}
                  >
                    {t("auth.trackProgressTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#86868b",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t("auth.trackProgressDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* View Statistics Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  background: "#ffffff",
                  border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 122, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <Assessment sx={{ fontSize: 30, color: "#007AFF" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 400,
                      fontSize: "1.1rem",
                      color: "#1d1d1f",
                      letterSpacing: "-0.01em",
                      mb: 1,
                    }}
                  >
                    {t("auth.viewStatisticsTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#86868b",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t("auth.viewStatisticsDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Car Performance Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  background: "#ffffff",
                  border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 122, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <DirectionsCar sx={{ fontSize: 30, color: "#007AFF" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 400,
                      fontSize: "1.1rem",
                      color: "#1d1d1f",
                      letterSpacing: "-0.01em",
                      mb: 1,
                    }}
                  >
                    {t("auth.carPerformanceTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#86868b",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t("auth.carPerformanceDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Driver Recognition Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  background: "#ffffff",
                  border: "0.5px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 122, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <Star sx={{ fontSize: 30, color: "#007AFF" }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 400,
                      fontSize: "1.1rem",
                      color: "#1d1d1f",
                      letterSpacing: "-0.01em",
                      mb: 1,
                    }}
                  >
                    {t("auth.driverRecognitionTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#86868b",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t("auth.driverRecognitionDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            width: "100%",
            maxWidth: 400,
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/signup")}
            sx={{
              py: 2,
              fontSize: "1rem",
              fontWeight: 400,
              backgroundColor: "#007AFF",
              borderRadius: 2,
              textTransform: "none",
              letterSpacing: "-0.01em",
              "&:hover": {
                backgroundColor: "#0056CC",
              },
            }}
          >
            {t("auth.homeGetStarted")}
          </Button>
        </Box>

        {/* Login Link */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#86868b",
              fontSize: "0.875rem",
              mb: 1,
            }}
          >
            {t("auth.homeAlreadyHaveAccount")}
          </Typography>
          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{
              color: "#007AFF",
              fontWeight: 400,
              fontSize: "0.875rem",
              textTransform: "none",
              letterSpacing: "-0.01em",
              p: 0,
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#0056CC",
              },
            }}
          >
            {t("auth.signIn")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
