import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { City, Country, State } from "country-state-city";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import { useUserContext } from "../contexts/UserContext";
import { driverDetailsService } from "../services/driverDetailsService";
import { CreateDriverDetailsData } from "../types";

const DriverDetailsCompletion: React.FC = () => {
  const { user, profile } = useUserContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Driver details data
  const [driverDetails, setDriverDetails] = useState<CreateDriverDetailsData>({
    profile_id: "",
    date_of_birth: "",
    gender: "male",
    nationality: "",
    languages: [],
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    address: "",
    city: "",
    state_province: "",
    postal_code: "00000",
    country: "CM", // Cameroon
    license_number: "",
    license_issue_date: "",
    license_expiry_date: "",
    license_class: "",
    license_issuing_authority: t("profile.issuingAuthorityDefault"),
    years_of_experience: 0,
    preferred_transmission: "both",
    availability_status: "available",
    preferred_working_hours: null,
    communication_preference: "phone",
    // ID Card Information
    id_card_type: "national_id",
    id_card_number: "",
    id_card_expiry_date: "",
    license_image_url: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Country/State/City data
  const [selectedCountry, setSelectedCountry] = useState("CM");
  const [selectedState, setSelectedState] = useState("");
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);

  // Language options
  const languageOptions = [
    "English",
    "French",
    "Lingala",
    "Swahili",
    "Arabic",
    "Portuguese",
    "Spanish",
    "German",
    "Italian",
    "Chinese",
    "Japanese",
    "Korean",
    "Russian",
    "Hindi",
    "Other",
  ];

  // Emergency contact relationship options
  const relationshipOptions = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Friend",
    "Colleague",
    "Other",
  ];

  // Load countries and states on component mount
  useEffect(() => {
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry);
      setAvailableStates(states);
      setSelectedState("");
      setAvailableCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const cities = City.getCitiesOfState(selectedCountry, selectedState);
      setAvailableCities(cities);
    }
  }, [selectedCountry, selectedState]);

  // Update driver details when user is available
  useEffect(() => {
    if (user?.id) {
      setDriverDetails((prev) => ({
        ...prev,
        profile_id: user.id,
      }));
    }
  }, [user?.id]);

  // Prefill emergency contact phone if user logged in with phone OTP
  useEffect(() => {
    if (user?.phone && !driverDetails.emergency_contact_phone) {
      setDriverDetails((prev) => ({
        ...prev,
        emergency_contact_phone: user.phone || "",
      }));
    }
  }, [user?.phone, driverDetails.emergency_contact_phone]);

  // Redirect if user is not a driver or doesn't have a profile
  useEffect(() => {
    if (profile && profile.user_type !== "driver") {
      navigate("/");
    } else if (!profile) {
      navigate("/complete-profile");
    }
  }, [profile, navigate]);

  // Utility function to filter out empty values
  const filterEmptyValues = (data: any) => {
    const filtered: any = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      // Keep the value if it's not empty, null, undefined, or an empty array
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate driver details
      if (!driverDetails.date_of_birth) {
        setError(t("profile.dateOfBirthRequired"));
        setLoading(false);
        return;
      }

      if (!driverDetails.license_number) {
        setError(t("profile.licenseNumberRequired"));
        setLoading(false);
        return;
      }

      if (!driverDetails.license_expiry_date) {
        setError(t("profile.licenseExpiryRequired"));
        setLoading(false);
        return;
      }

      // Filter out empty values before submitting
      const filteredDriverDetails = filterEmptyValues(driverDetails);

      // Ensure profile_id is always included
      const driverDetailsWithProfileId = {
        ...filteredDriverDetails,
        profile_id: profile!.id,
      };

      // Create driver details
      await driverDetailsService.createDriverDetails(
        driverDetailsWithProfileId
      );

      // Redirect to dashboard after successful completion
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }

    setLoading(false);
  };

  const handleDriverDetailsChange =
    (field: keyof CreateDriverDetailsData) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent
    ) => {
      const value = e.target.value;
      setDriverDetails((prev) => ({
        ...prev,
        [field]:
          field === "id_card_type" && value === "" ? "national_id" : value,
      }));
    };

  const handleLanguageChange = (event: SelectChangeEvent<string[]>) => {
    setDriverDetails((prev) => ({
      ...prev,
      languages: event.target.value as string[],
    }));
  };

  const handleCountryChange = (event: SelectChangeEvent) => {
    const countryCode = event.target.value;
    setSelectedCountry(countryCode);
    setDriverDetails((prev) => ({
      ...prev,
      country: countryCode,
      state_province: "",
      city: "",
    }));
  };

  const handleStateChange = (event: SelectChangeEvent) => {
    const stateCode = event.target.value;
    setSelectedState(stateCode);
    setDriverDetails((prev) => ({
      ...prev,
      state_province: stateCode,
      city: "",
    }));
  };

  const handleCityChange = (event: SelectChangeEvent) => {
    setDriverDetails((prev) => ({
      ...prev,
      city: event.target.value,
    }));
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f2f7" }}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
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
              mb: 4,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              letterSpacing: "-0.01em",
            }}
          >
            {t("profile.completeDriverDetails")}
          </Typography>

          {/* Driver Details Encouragement Message */}
          <Alert
            severity="info"
            sx={{
              mb: 4,
              backgroundColor: "rgba(0, 122, 255, 0.1)",
              border: "0.5px solid rgba(0, 122, 255, 0.2)",
              borderRadius: 2,
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              {t("profile.driverDetailsEncouragement")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("profile.driverDetailsEncouragementSubtitle")}
            </Typography>
          </Alert>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Complete your driver details to get started, or skip for now and
            complete them later from your profile page.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
            >
              Driver Information
            </Typography>

            <Grid container spacing={2}>
              {/* Personal Information */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Personal Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={driverDetails.date_of_birth}
                  onChange={handleDriverDetailsChange("date_of_birth")}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={driverDetails.gender}
                    onChange={handleDriverDetailsChange("gender")}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">
                      Prefer not to say
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Nationality</InputLabel>
                  <Select
                    value={driverDetails.nationality}
                    onChange={handleDriverDetailsChange("nationality")}
                    label="Nationality"
                  >
                    {Country.getAllCountries().map((country) => (
                      <MenuItem key={country.isoCode} value={country.isoCode}>
                        {country.flag} {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Languages Spoken</InputLabel>
                  <Select
                    multiple
                    value={driverDetails.languages}
                    onChange={handleLanguageChange}
                    input={<OutlinedInput label="Languages Spoken" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {languageOptions.map((language) => (
                      <MenuItem key={language} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Contact Information */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={driverDetails.address}
                  onChange={handleDriverDetailsChange("address")}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    label="Country"
                  >
                    {Country.getAllCountries().map((country) => (
                      <MenuItem key={country.isoCode} value={country.isoCode}>
                        {country.flag} {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>State/Province</InputLabel>
                  <Select
                    value={selectedState}
                    onChange={handleStateChange}
                    label="State/Province"
                    disabled={!selectedCountry}
                  >
                    {availableStates.map((state) => (
                      <MenuItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={driverDetails.city}
                    onChange={handleCityChange}
                    label="City"
                    disabled={!selectedState}
                  >
                    {availableCities.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={driverDetails.postal_code}
                  onChange={handleDriverDetailsChange("postal_code")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Communication Preference</InputLabel>
                  <Select
                    value={driverDetails.communication_preference}
                    onChange={handleDriverDetailsChange(
                      "communication_preference"
                    )}
                    label="Communication Preference"
                  >
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Emergency Contact */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Emergency Contact
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={driverDetails.emergency_contact_name}
                  onChange={handleDriverDetailsChange("emergency_contact_name")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={driverDetails.emergency_contact_phone}
                  onChange={handleDriverDetailsChange(
                    "emergency_contact_phone"
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Relationship</InputLabel>
                  <Select
                    value={driverDetails.emergency_contact_relationship}
                    onChange={handleDriverDetailsChange(
                      "emergency_contact_relationship"
                    )}
                    label="Relationship"
                  >
                    {relationshipOptions.map((relationship) => (
                      <MenuItem key={relationship} value={relationship}>
                        {relationship}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Driver License Information */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Driver License Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="License Number"
                  value={driverDetails.license_number}
                  onChange={handleDriverDetailsChange("license_number")}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="License Class"
                  value={driverDetails.license_class}
                  onChange={handleDriverDetailsChange("license_class")}
                  placeholder="e.g., A, B, C"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="License Issue Date"
                  value={driverDetails.license_issue_date}
                  onChange={handleDriverDetailsChange("license_issue_date")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="License Expiry Date"
                  value={driverDetails.license_expiry_date}
                  onChange={handleDriverDetailsChange("license_expiry_date")}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Issuing Authority"
                  value={driverDetails.license_issuing_authority}
                  onChange={handleDriverDetailsChange(
                    "license_issuing_authority"
                  )}
                  placeholder="e.g., Ministry of Transport"
                />
              </Grid>

              {/* Driver License Upload */}
              <Grid size={{ xs: 12 }}>
                <FileUpload
                  bucket="driver_licenses"
                  path={profile?.id || ""}
                  accept="image/*,application/pdf"
                  maxSizeMB={5}
                  onUploadComplete={(url) => {
                    // Single file upload - url will be a string
                    const urlString = typeof url === "string" ? url : "";
                    setDriverDetails((prev) => ({
                      ...prev,
                      license_image_url: urlString,
                    }));
                  }}
                  existingFileUrl={driverDetails.license_image_url || null}
                  label="Driver's License Image"
                  helperText="Upload a clear photo of your driver's license (front and back). This is required for verification."
                />
              </Grid>

              {/* Professional Information */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Professional Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Years of Experience"
                  value={driverDetails.years_of_experience}
                  onChange={handleDriverDetailsChange("years_of_experience")}
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Transmission</InputLabel>
                  <Select
                    value={driverDetails.preferred_transmission}
                    onChange={handleDriverDetailsChange(
                      "preferred_transmission"
                    )}
                    label="Preferred Transmission"
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="automatic">Automatic</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* ID Card Information */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {t("profile.idCardType")} (Optional)
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("profile.idCardType")}</InputLabel>
                  <Select
                    value={driverDetails.id_card_type || "national_id"}
                    onChange={handleDriverDetailsChange("id_card_type")}
                    label={t("profile.idCardType")}
                  >
                    <MenuItem value="">
                      <em>{t("profile.noneSelected")}</em>
                    </MenuItem>
                    <MenuItem value="passport">Passport</MenuItem>
                    <MenuItem value="national_id">National ID Card</MenuItem>
                    <MenuItem value="residency_card">Residency Card</MenuItem>
                    <MenuItem value="drivers_license">
                      Driver's License
                    </MenuItem>
                    <MenuItem value="military_id">Military ID</MenuItem>
                    <MenuItem value="student_id">Student ID</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("profile.idCardNumber")}
                  value={driverDetails.id_card_number || ""}
                  onChange={handleDriverDetailsChange("id_card_number")}
                  helperText={t("profile.idCardNumberHelper")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label={t("profile.idCardExpiryDate")}
                  value={driverDetails.id_card_expiry_date || ""}
                  onChange={handleDriverDetailsChange("id_card_expiry_date")}
                  InputLabelProps={{ shrink: true }}
                  helperText={t("profile.idCardExpiryHelper")}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                sx={{
                  flex: 1,
                  py: 2,
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  borderRadius: 2,
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  color: "#1d1d1f",
                  "&:hover": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {t("profile.skipForNow")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  flex: 1,
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
                {loading ? t("profile.saving") : t("profile.completeProfile")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DriverDetailsCompletion;
