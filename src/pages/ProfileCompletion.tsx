import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUserContext } from "../contexts/UserContext";
import { organizationService } from "../services/organizationService";
import { Organization } from "../types";

const ProfileCompletion: React.FC = () => {
  const { createProfile } = useUserContext();
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
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
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
          sx={{ mb: 3 }}
        >
          Welcome! Please complete your profile to get started with the rentals
          platform.
        </Typography>

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
            helperText="Optional - for communication purposes"
          />

          <FormControl margin="normal" fullWidth>
            <InputLabel id="organization-label">Organization *</InputLabel>
            <Select
              labelId="organization-label"
              id="organization"
              value={formData.organization_id}
              label="Organization *"
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
                Loading organizations...
              </Typography>
            )}
          </FormControl>

          <FormControl margin="normal" fullWidth>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              User Type *
            </Typography>
            <RadioGroup
              value={formData.user_type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  user_type: e.target.value as "driver" | "owner",
                }))
              }
            >
              <FormControlLabel
                value="driver"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Driver</Typography>
                    <Typography variant="body2" color="text.secondary">
                      I drive vehicles and track my earnings
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="owner"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Owner</Typography>
                    <Typography variant="body2" color="text.secondary">
                      I own vehicles and manage drivers
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Creating Profile..." : "Complete Profile"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileCompletion;
