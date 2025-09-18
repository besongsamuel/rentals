import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const ProfileCompletion: React.FC = () => {
  const { createProfile, profile } = useUserContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Basic profile data
  const [formData, setFormData] = useState({
    full_name: "",
    user_type: "driver" as "driver" | "owner",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if user already has a profile
  useEffect(() => {
    if (profile) {
      if (profile.user_type === "driver") {
        navigate("/complete-details");
      } else {
        navigate("/");
      }
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Form submitted");

    try {
      // Validate basic profile data
      if (!formData.full_name.trim()) {
        setError(t("profile.fullNameRequired"));
        setLoading(false);
        return;
      }

      // Create basic profile first (only if profile doesn't exist)
      if (!profile) {
        console.log("Creating profile with data:", {
          full_name: formData.full_name.trim(),
          user_type: formData.user_type,
          phone: formData.phone.trim() || undefined,
        });

        const { data, error } = await createProfile({
          full_name: formData.full_name.trim(),
          user_type: formData.user_type,
          phone: formData.phone.trim() || undefined,
        });

        if (error) {
          console.error("Profile creation error:", error);
          setError(error.message);
          setLoading(false);
          return;
        } else {
          console.log("Profile created successfully:", data);
        }
      } else {
        console.log("Profile already exists, skipping profile creation");
      }

      // Redirect all users to dashboard after profile creation
      // Driver details can be completed later from the profile page
      console.log("Profile created successfully, redirecting to dashboard");
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }

    setLoading(false);
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const renderBasicProfileForm = () => (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: "rgba(255, 59, 48, 0.1)",
            border: "0.5px solid rgba(255, 59, 48, 0.2)",
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      <TextField
        required
        fullWidth
        id="full_name"
        label={t("profile.fullName")}
        name="full_name"
        autoComplete="name"
        autoFocus
        value={formData.full_name}
        onChange={handleInputChange("full_name")}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 122, 255, 0.5)",
            },
          },
        }}
      />

      <TextField
        fullWidth
        id="phone"
        label={t("profile.phoneNumber")}
        name="phone"
        autoComplete="tel"
        value={formData.phone}
        onChange={handleInputChange("phone")}
        helperText={t("profile.phoneNumberHelper")}
        sx={{
          mb: 4,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 122, 255, 0.5)",
            },
          },
        }}
      />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          {t("profile.chooseRoleRequired")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {t("profile.cannotBeChangedLater")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              flex: 1,
              cursor: "pointer",
              border: formData.user_type === "driver" ? 3 : 1,
              borderColor:
                formData.user_type === "driver" ? "primary.main" : "divider",
              backgroundColor:
                formData.user_type === "driver"
                  ? "primary.50"
                  : "background.paper",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor:
                  formData.user_type === "driver"
                    ? "primary.100"
                    : "primary.25",
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            }}
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                user_type: "driver",
              }))
            }
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color:
                    formData.user_type === "driver"
                      ? "primary.main"
                      : "text.primary",
                }}
              >
                🚗 Driver
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Drive cars and earn money
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              cursor: "pointer",
              border: formData.user_type === "owner" ? 3 : 1,
              borderColor:
                formData.user_type === "owner" ? "secondary.main" : "divider",
              backgroundColor:
                formData.user_type === "owner"
                  ? "secondary.50"
                  : "background.paper",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "secondary.main",
                backgroundColor:
                  formData.user_type === "owner"
                    ? "secondary.100"
                    : "secondary.25",
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            }}
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                user_type: "owner",
              }))
            }
          >
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color:
                    formData.user_type === "owner"
                      ? "secondary.main"
                      : "text.primary",
                }}
              >
                🏢 Car Owner
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Own cars and assign drivers
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          py: 2,
          fontSize: "0.875rem",
          fontWeight: 400,
          backgroundColor: "#007AFF",
          borderRadius: 2,
          textTransform: "none",
          letterSpacing: "-0.01em",
          "&:hover": {
            backgroundColor: "#0056CC",
          },
          "&:disabled": {
            backgroundColor: "#C7C7CC",
            color: "#8E8E93",
          },
        }}
      >
        {loading ? t("profile.loading") : t("profile.continue")}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f2f7" }}>
      <Container 
        component="main" 
        maxWidth="sm" 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 500,
            p: 4,
            background: "#ffffff",
            border: "0.5px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{
              fontWeight: 400,
              textAlign: "center",
              color: "#1d1d1f",
              mb: 2,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              letterSpacing: "-0.01em",
            }}
          >
            {t("profile.completeProfile")}
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ 
              mb: 4, 
              fontWeight: 400,
              color: "#86868b",
              fontSize: "0.875rem",
              letterSpacing: "-0.01em",
            }}
          >
            {t("profile.completeProfileDescription")}
          </Typography>
          {renderBasicProfileForm()}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfileCompletion;
