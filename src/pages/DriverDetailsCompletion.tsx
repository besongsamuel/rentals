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
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import { driverDetailsService } from "../services/driverDetailsService";
import { CreateDriverDetailsData } from "../types";

const DriverDetailsCompletion: React.FC = () => {
  const { user, profile } = useUserContext();
  const navigate = useNavigate();

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
    postal_code: "",
    country: "CM", // Cameroon
    license_number: "",
    license_issue_date: "",
    license_expiry_date: "",
    license_class: "",
    license_issuing_authority: "",
    years_of_experience: 0,
    preferred_transmission: "both",
    availability_status: "available",
    preferred_working_hours: null,
    communication_preference: "phone",
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

  // Redirect if user is not a driver or doesn't have a profile
  useEffect(() => {
    if (profile && profile.user_type !== "driver") {
      navigate("/");
    } else if (!profile) {
      navigate("/complete-profile");
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate driver details
      if (!driverDetails.date_of_birth) {
        setError("Date of birth is required");
        setLoading(false);
        return;
      }

      if (!driverDetails.license_number) {
        setError("License number is required");
        setLoading(false);
        return;
      }

      if (!driverDetails.license_expiry_date) {
        setError("License expiry date is required");
        setLoading(false);
        return;
      }

      // Create driver details
      await driverDetailsService.createDriverDetails(driverDetails);
      
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
      setDriverDetails((prev) => ({
        ...prev,
        [field]: e.target.value,
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
          Complete Your Driver Details
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Please provide your driver information to start earning
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
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
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
                  onChange={handleDriverDetailsChange("communication_preference")}
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
                onChange={handleDriverDetailsChange("emergency_contact_phone")}
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
                onChange={handleDriverDetailsChange("license_issuing_authority")}
                placeholder="e.g., Ministry of Transport"
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
                  onChange={handleDriverDetailsChange("preferred_transmission")}
                  label="Preferred Transmission"
                >
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="automatic">Automatic</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{ flex: 1 }}
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DriverDetailsCompletion;
