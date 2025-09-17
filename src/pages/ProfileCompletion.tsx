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
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const ProfileCompletion: React.FC = () => {
  const { createProfile, profile } = useUserContext();
  const navigate = useNavigate();

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
        setError("Full name is required");
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

      // Redirect based on user type
      if (formData.user_type === "driver") {
        console.log("Redirecting to driver details completion");
        navigate("/complete-details");
      } else {
        console.log("User type is owner, profile complete");
        navigate("/");
      }
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="full_name"
        label="Full Name"
        name="full_name"
        autoComplete="name"
        autoFocus
        value={formData.full_name}
        onChange={handleInputChange("full_name")}
      />

      <TextField
        margin="normal"
        fullWidth
        id="phone"
        label="Phone Number"
        name="phone"
        autoComplete="tel"
        value={formData.phone}
        onChange={handleInputChange("phone")}
        helperText="Optional - for emergency contact"
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
          Choose Your Role *
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
          This cannot be changed later
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
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? "Loading..." : "Continue"}
      </Button>
    </Box>
  );

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Complete Your Profile
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 2 }}
        >
          Let's get started with your basic information
        </Typography>
        {renderBasicProfileForm()}
      </Paper>
    </Container>
  );
};

export default ProfileCompletion;
