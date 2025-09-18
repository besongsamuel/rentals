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
import React, { useCallback, useEffect, useState } from "react";
import { useUserContext } from "../contexts/UserContext";
import { driverDetailsService } from "../services/driverDetailsService";
import { CreateDriverDetailsData } from "../types";

const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useUserContext();

  // Profile data
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
  });

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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [driverDetailsLoading, setDriverDetailsLoading] = useState(false);

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

  // Load profile data when component mounts
  const loadDriverDetails = useCallback(async () => {
    if (!profile?.id) return;

    setDriverDetailsLoading(true);
    try {
      const existingDetails = await driverDetailsService.getDriverDetails(
        profile.id
      );
      if (existingDetails) {
        // Convert DriverDetails to CreateDriverDetailsData format
        const driverDetailsData: CreateDriverDetailsData = {
          profile_id: existingDetails.profile_id,
          date_of_birth: existingDetails.date_of_birth || "",
          gender: existingDetails.gender || "male",
          nationality: existingDetails.nationality || "",
          languages: existingDetails.languages || [],
          emergency_contact_name: existingDetails.emergency_contact_name || "",
          emergency_contact_phone:
            existingDetails.emergency_contact_phone || "",
          emergency_contact_relationship:
            existingDetails.emergency_contact_relationship || "",
          address: existingDetails.address || "",
          city: existingDetails.city || "",
          state_province: existingDetails.state_province || "",
          postal_code: existingDetails.postal_code || "",
          country: existingDetails.country || "CM",
          license_number: existingDetails.license_number || "",
          license_issue_date: existingDetails.license_issue_date || "",
          license_expiry_date: existingDetails.license_expiry_date || "",
          license_class: existingDetails.license_class || "",
          license_issuing_authority:
            existingDetails.license_issuing_authority || "",
          years_of_experience: existingDetails.years_of_experience || 0,
          preferred_transmission:
            existingDetails.preferred_transmission || "both",
          availability_status:
            existingDetails.availability_status || "available",
          preferred_working_hours:
            existingDetails.preferred_working_hours || null,
          communication_preference:
            existingDetails.communication_preference || "phone",
        };
        setDriverDetails(driverDetailsData);
        setSelectedCountry(existingDetails.country || "CM");
        setSelectedState(existingDetails.state_province || "");
      }
    } catch (error) {
      console.error("Error loading driver details:", error);
    } finally {
      setDriverDetailsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });

      // Load driver details if user is a driver
      if (profile.user_type === "driver") {
        loadDriverDetails();
      }
    }
  }, [profile, loadDriverDetails]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await updateProfile(profileData);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Profile updated successfully!");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }

    setLoading(false);
  };

  const handleDriverDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!profile?.id) {
        setError("Profile not found");
        return;
      }

      // Check if driver details already exist
      const existingDetails = await driverDetailsService.getDriverDetails(
        profile.id
      );

      if (existingDetails) {
        // Update existing driver details
        await driverDetailsService.updateDriverDetails(
          profile.id,
          driverDetails
        );
        setSuccess("Driver details updated successfully!");
      } else {
        // Create new driver details
        await driverDetailsService.createDriverDetails(driverDetails);
        setSuccess("Driver details created successfully!");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }

    setLoading(false);
  };

  const handleProfileChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
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

  if (!profile) {
    return (
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        My Profile
      </Typography>

      {/* Profile Information */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
        >
          Profile Information
        </Typography>

        <Box
          component="form"
          onSubmit={handleProfileSubmit}
          sx={{ width: "100%" }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileData.full_name}
                onChange={handleProfileChange("full_name")}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={profile.email || ""}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phone}
                onChange={handleProfileChange("phone")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="User Type"
                value={profile.user_type === "driver" ? "Driver" : "Car Owner"}
                disabled
                helperText="User type cannot be changed"
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </Box>
      </Paper>

      {/* Driver Details - Only show for drivers */}
      {profile.user_type === "driver" && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
          >
            Driver Details
          </Typography>

          {driverDetailsLoading ? (
            <Typography>Loading driver details...</Typography>
          ) : (
            <Box
              component="form"
              onSubmit={handleDriverDetailsSubmit}
              sx={{ width: "100%" }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* Personal Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
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
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
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
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
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
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Emergency Contact
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    value={driverDetails.emergency_contact_name}
                    onChange={handleDriverDetailsChange(
                      "emergency_contact_name"
                    )}
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
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Driver License Information
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={driverDetails.license_number}
                    onChange={handleDriverDetailsChange("license_number")}
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

                {/* Professional Information */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
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
              </Grid>

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Driver Details"}
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ProfilePage;
