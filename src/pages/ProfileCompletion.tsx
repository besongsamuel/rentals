import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";
import { organizationService } from "../services/organizationService";
import { Organization } from "../types";

const ProfileCompletion: React.FC = () => {
  const { createProfile } = useUserContext();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    full_name: "",
    user_type: "driver" as "driver" | "owner",
    phone: "",
    organization_id: "",
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);

  // Load organizations on component mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await organizationService.getAllOrganizations();
        setOrganizations(orgs);
        // Set default organization if available
        if (orgs.length > 0) {
          setFormData((prev) => ({ ...prev, organization_id: orgs[0].id }));
        }
      } catch (error) {
        console.error("Error loading organizations:", error);
        setError("Failed to load organizations");
      } finally {
        setLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.full_name.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }

    if (!formData.organization_id) {
      setError("Organization is required");
      setLoading(false);
      return;
    }

    const { error } = await createProfile({
      full_name: formData.full_name.trim(),
      user_type: formData.user_type,
      phone: formData.phone.trim() || undefined,
      organization_id: formData.organization_id,
    });

    if (error) {
      setError(error.message);
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

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
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
          {t("profile.completeProfile")}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 2 }}
        >
          {t("profile.welcomeMessage")}
        </Typography>

        {formData.user_type === "driver" ? (
          <Typography
            variant="body2"
            color="primary.main"
            align="center"
            sx={{
              mb: 3,
              fontWeight: 500,
              p: 2,
              bgcolor: "primary.50",
              borderRadius: 1,
            }}
          >
            {t("profile.driverProfileMessage")}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="secondary.main"
            align="center"
            sx={{
              mb: 3,
              fontWeight: 500,
              p: 2,
              bgcolor: "secondary.50",
              borderRadius: 1,
            }}
          >
            {t("profile.ownerProfileMessage")}
          </Typography>
        )}

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
            label={t("profile.fullName")}
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
            label={t("profile.phone")}
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleInputChange("phone")}
            helperText={t("profile.phoneHelper")}
          />

          <FormControl margin="normal" fullWidth>
            <InputLabel id="organization-label">
              {t("profile.organization")} *
            </InputLabel>
            <Select
              labelId="organization-label"
              id="organization"
              value={formData.organization_id}
              label={`${t("profile.organization")} *`}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  organization_id: e.target.value,
                }))
              }
              disabled={loadingOrganizations}
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
            {loadingOrganizations && (
              <Typography variant="caption" color="text.secondary">
                {t("common.loading")}
              </Typography>
            )}
          </FormControl>

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
              {t("profile.userType")} *
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
              {t("profile.chooseRoleCarefully")}
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
                    formData.user_type === "driver"
                      ? "primary.main"
                      : "divider",
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
                    🚗 {t("profile.driver")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {t("profile.driverDescription")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 1,
                      fontStyle: "italic",
                      opacity: 0.8,
                    }}
                  >
                    {t("profile.driverAdditionalInfo")}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  border: formData.user_type === "owner" ? 3 : 1,
                  borderColor:
                    formData.user_type === "owner"
                      ? "secondary.main"
                      : "divider",
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
                    🏢 {t("profile.owner")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {t("profile.ownerDescription")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 1,
                      fontStyle: "italic",
                      opacity: 0.8,
                    }}
                  >
                    {t("profile.ownerAdditionalInfo")}
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
            {loading ? t("common.loading") : t("profile.complete")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileCompletion;
