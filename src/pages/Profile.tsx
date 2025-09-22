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
import ReactFlagsSelect from "react-flags-select";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";
import { driverDetailsService } from "../services/driverDetailsService";
import { CreateDriverDetailsData } from "../types";

const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useUserContext();
  const { t } = useTranslation();

  // Profile data
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    country: "CM", // Default to Cameroon
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
    // ID Card Information
    id_card_type: "national_id",
    id_card_number: "",
    id_card_expiry_date: "",
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
          // ID Card Information
          id_card_type: existingDetails.id_card_type || "national_id",
          id_card_number: existingDetails.id_card_number || "",
          id_card_expiry_date: existingDetails.id_card_expiry_date || "",
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
        country: profile.country || "CM",
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
        setSuccess(t("profile.profileUpdatedSuccessfully"));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }

    setLoading(false);
  };

  const handleProfileCountryChange = (countryCode: string) => {
    setProfileData((prev) => ({
      ...prev,
      country: countryCode,
    }));
  };

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

  const handleDriverDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!profile?.id) {
        setError(t("profile.profileNotFound"));
        return;
      }

      // Filter out empty values before submitting
      const filteredDriverDetails = filterEmptyValues(driverDetails);

      // Ensure profile_id is always included
      const driverDetailsWithProfileId = {
        ...filteredDriverDetails,
        profile_id: profile.id,
      };

      // Check if driver details already exist
      const existingDetails = await driverDetailsService.getDriverDetails(
        profile.id
      );

      if (existingDetails) {
        // Update existing driver details
        await driverDetailsService.updateDriverDetails(
          profile.id,
          driverDetailsWithProfileId
        );
        setSuccess(t("profile.driverDetailsUpdatedSuccessfully"));
      } else {
        // Create new driver details
        await driverDetailsService.createDriverDetails(
          driverDetailsWithProfileId
        );
        setSuccess(t("profile.driverDetailsCreatedSuccessfully"));
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

  if (!profile) {
    return (
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <Typography>{t("profile.loadingProfile")}</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      {/* Custom styles for react-flags-select */}
      <style>{`
        .country-selector-button {
          width: 100% !important;
          height: 56px !important;
          border: 1px solid rgba(0, 0, 0, 0.23) !important;
          border-radius: 4px !important;
          background-color: #ffffff !important;
          padding: 0 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          font-size: 16px !important;
          color: #1d1d1f !important;
          transition: border-color 0.2s ease-in-out !important;
          min-height: 56px !important;
        }
        .country-selector-button:hover {
          border-color: rgba(0, 122, 255, 0.5) !important;
        }
        .country-selector-button:focus {
          border-color: #007AFF !important;
          outline: none !important;
        }
        .country-selector-options {
          border: 1px solid rgba(0, 0, 0, 0.23) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          max-height: 300px !important;
          overflow-y: auto !important;
        }
        .country-selector-options .flag-select__option {
          padding: 12px 14px !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
          font-size: 14px !important;
        }
        .country-selector-options .flag-select__option:hover {
          background-color: rgba(0, 122, 255, 0.05) !important;
        }
        .country-selector-options .flag-select__option--selected {
          background-color: rgba(0, 122, 255, 0.1) !important;
        }
      `}</style>
      <Typography component="h1" variant="h4" gutterBottom>
        {t("profile.myProfile")}
      </Typography>

      {/* Profile Information */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
        >
          {t("profile.profileInformation")}
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
                label={t("profile.fullName")}
                value={profileData.full_name}
                onChange={handleProfileChange("full_name")}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("profile.email")}
                value={profile.email || ""}
                disabled
                helperText={t("profile.emailCannotBeChanged")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("profile.phoneNumber")}
                value={profileData.phone}
                onChange={handleProfileChange("phone")}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: "#1d1d1f",
                    fontSize: "0.875rem",
                    fontWeight: 400,
                  }}
                >
                  {t("profile.country")}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <ReactFlagsSelect
                    selected={profileData.country}
                    onSelect={handleProfileCountryChange}
                    placeholder={t("profile.countryHelper")}
                    searchable
                    searchPlaceholder="Search countries..."
                    className="country-selector"
                    selectButtonClassName="country-selector-button"
                    selectedSize={20}
                    optionsSize={16}
                    showSelectedLabel={true}
                    showOptionLabel={true}
                    showSecondarySelectedLabel={true}
                    fullWidth
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#86868b",
                    fontSize: "0.75rem",
                    mt: 0.5,
                    display: "block",
                  }}
                >
                  {t("profile.countryHelper")}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("profile.userType")}
                value={
                  profile.user_type === "driver"
                    ? t("profile.driver")
                    : t("profile.owner")
                }
                disabled
                helperText={t("profile.userTypeCannotBeChanged")}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? t("profile.updating") : t("profile.updateProfile")}
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
            {t("profile.completeDriverDetails")}
          </Typography>

          {/* Driver Details Encouragement Message */}
          <Alert
            severity="info"
            sx={{
              mb: 3,
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              border: "1px solid rgba(33, 150, 243, 0.3)",
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

          {driverDetailsLoading ? (
            <Typography>{t("profile.loadingDriverDetails")}</Typography>
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
                    {t("profile.personalInformation")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t("profile.dateOfBirth")}
                    value={driverDetails.date_of_birth}
                    onChange={handleDriverDetailsChange("date_of_birth")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t("profile.gender")}</InputLabel>
                    <Select
                      value={driverDetails.gender}
                      onChange={handleDriverDetailsChange("gender")}
                      label={t("profile.gender")}
                    >
                      <MenuItem value="male">{t("profile.male")}</MenuItem>
                      <MenuItem value="female">{t("profile.female")}</MenuItem>
                      <MenuItem value="other">{t("profile.other")}</MenuItem>
                      <MenuItem value="prefer_not_to_say">
                        {t("profile.preferNotToSay")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t("profile.nationality")}</InputLabel>
                    <Select
                      value={driverDetails.nationality}
                      onChange={handleDriverDetailsChange("nationality")}
                      label={t("profile.nationality")}
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
                    <InputLabel>{t("profile.languagesSpoken")}</InputLabel>
                    <Select
                      multiple
                      value={driverDetails.languages}
                      onChange={handleLanguageChange}
                      input={
                        <OutlinedInput label={t("profile.languagesSpoken")} />
                      }
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
                    {t("profile.contactInformation")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label={t("profile.address")}
                    value={driverDetails.address}
                    onChange={handleDriverDetailsChange("address")}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t("profile.country")}</InputLabel>
                    <Select
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      label={t("profile.country")}
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
                    <InputLabel>{t("profile.stateProvince")}</InputLabel>
                    <Select
                      value={selectedState}
                      onChange={handleStateChange}
                      label={t("profile.stateProvince")}
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
                    <InputLabel>{t("profile.city")}</InputLabel>
                    <Select
                      value={driverDetails.city}
                      onChange={handleCityChange}
                      label={t("profile.city")}
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
                    label={t("profile.postalCode")}
                    value={driverDetails.postal_code}
                    onChange={handleDriverDetailsChange("postal_code")}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>
                      {t("profile.communicationPreference")}
                    </InputLabel>
                    <Select
                      value={driverDetails.communication_preference}
                      onChange={handleDriverDetailsChange(
                        "communication_preference"
                      )}
                      label={t("profile.communicationPreference")}
                    >
                      <MenuItem value="phone">{t("profile.phone")}</MenuItem>
                      <MenuItem value="email">{t("profile.email")}</MenuItem>
                      <MenuItem value="sms">{t("profile.sms")}</MenuItem>
                      <MenuItem value="whatsapp">
                        {t("profile.whatsapp")}
                      </MenuItem>
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
                    {t("profile.emergencyContact")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("profile.emergencyContactName")}
                    value={driverDetails.emergency_contact_name}
                    onChange={handleDriverDetailsChange(
                      "emergency_contact_name"
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("profile.emergencyContactPhone")}
                    value={driverDetails.emergency_contact_phone}
                    onChange={handleDriverDetailsChange(
                      "emergency_contact_phone"
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t("profile.relationship")}</InputLabel>
                    <Select
                      value={driverDetails.emergency_contact_relationship}
                      onChange={handleDriverDetailsChange(
                        "emergency_contact_relationship"
                      )}
                      label={t("profile.relationship")}
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
                    {t("profile.driverLicenseInformation")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("profile.licenseNumber")}
                    value={driverDetails.license_number}
                    onChange={handleDriverDetailsChange("license_number")}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("profile.licenseClass")}
                    value={driverDetails.license_class}
                    onChange={handleDriverDetailsChange("license_class")}
                    placeholder={t("profile.licenseClassPlaceholder")}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t("profile.licenseIssueDate")}
                    value={driverDetails.license_issue_date}
                    onChange={handleDriverDetailsChange("license_issue_date")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t("profile.licenseExpiryDate")}
                    value={driverDetails.license_expiry_date}
                    onChange={handleDriverDetailsChange("license_expiry_date")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label={t("profile.issuingAuthority")}
                    value={driverDetails.license_issuing_authority}
                    onChange={handleDriverDetailsChange(
                      "license_issuing_authority"
                    )}
                    placeholder={t("profile.issuingAuthorityPlaceholder")}
                  />
                </Grid>

                {/* Professional Information */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    {t("profile.professionalInformation")}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t("profile.yearsOfExperience")}
                    value={driverDetails.years_of_experience}
                    onChange={handleDriverDetailsChange("years_of_experience")}
                    inputProps={{ min: 0, max: 50 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>
                      {t("profile.preferredTransmission")}
                    </InputLabel>
                    <Select
                      value={driverDetails.preferred_transmission}
                      onChange={handleDriverDetailsChange(
                        "preferred_transmission"
                      )}
                      label={t("profile.preferredTransmission")}
                    >
                      <MenuItem value="manual">
                        {t("profile.transmissions.manual")}
                      </MenuItem>
                      <MenuItem value="automatic">
                        {t("profile.transmissions.automatic")}
                      </MenuItem>
                      <MenuItem value="both">
                        {t("profile.transmissions.both")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* ID Card Information */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
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

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? t("profile.saving") : t("profile.saveDriverDetails")}
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ProfilePage;
