import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";
import { assignmentRequestService } from "../services/assignmentRequestService";
import { Car, CarAssignmentRequest } from "../types";

interface DriveRequestDialogProps {
  open: boolean;
  onClose: () => void;
  car: Car;
  existingRequest?: CarAssignmentRequest;
}

const DriveRequestDialog: React.FC<DriveRequestDialogProps> = ({
  open,
  onClose,
  car,
  existingRequest,
}) => {
  const { t } = useTranslation();
  const { profile } = useUserContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [currentRequest, setCurrentRequest] =
    useState<CarAssignmentRequest | null>(existingRequest || null);

  // Form state
  const [formData, setFormData] = useState({
    available_start_date: "",
    available_end_date: "",
    max_hours_per_week: "",
    driver_notes: "",
    experience_details: "",
  });

  const [noEndDate, setNoEndDate] = useState(false);

  // Check for existing request when dialog opens
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!open || !profile?.id) {
        setCheckingExisting(false);
        return;
      }

      try {
        setCheckingExisting(true);
        const existing = await assignmentRequestService.getExistingRequest(
          car.id,
          profile.id
        );

        if (existing) {
          setCurrentRequest(existing);
          // Populate form with existing data
          setFormData({
            available_start_date: existing.available_start_date || "",
            available_end_date: existing.available_end_date || "",
            max_hours_per_week: existing.max_hours_per_week?.toString() || "",
            driver_notes: existing.driver_notes || "",
            experience_details: existing.experience_details || "",
          });
          // Set no end date checkbox if end date is empty
          setNoEndDate(!existing.available_end_date);
        } else {
          setCurrentRequest(null);
          // Set default start date to today and max hours to 40
          const today = new Date().toISOString().split("T")[0];
          setFormData({
            available_start_date: today,
            available_end_date: "",
            max_hours_per_week: "40",
            driver_notes: "",
            experience_details: "",
          });
          setNoEndDate(true); // Default to no end date (indefinite availability)
        }
      } catch (err) {
        console.error("Error checking existing request:", err);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingRequest();
  }, [open, car.id, profile?.id]);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.available_start_date) {
      setError(t("driveRequests.startDateRequired"));
      return;
    }

    if (
      formData.available_end_date &&
      formData.available_end_date < formData.available_start_date
    ) {
      setError(t("driveRequests.endDateBeforeStart"));
      return;
    }

    setLoading(true);

    try {
      let result;

      if (currentRequest) {
        // Update existing request - use undefined instead of null for optional fields
        const updateData: any = {
          available_start_date: formData.available_start_date,
        };

        if (formData.available_end_date) {
          updateData.available_end_date = formData.available_end_date;
        }

        if (formData.max_hours_per_week) {
          updateData.max_hours_per_week = parseInt(formData.max_hours_per_week);
        }

        if (formData.driver_notes) {
          updateData.driver_notes = formData.driver_notes;
        }

        if (formData.experience_details) {
          updateData.experience_details = formData.experience_details;
        }

        result = await assignmentRequestService.updateRequest(
          currentRequest.id,
          updateData
        );
      } else {
        // Create new request - use undefined for optional fields
        const requestData: any = {
          car_id: car.id,
          available_start_date: formData.available_start_date,
        };

        if (formData.available_end_date) {
          requestData.available_end_date = formData.available_end_date;
        }

        if (formData.max_hours_per_week) {
          requestData.max_hours_per_week = parseInt(
            formData.max_hours_per_week
          );
        }

        if (formData.driver_notes) {
          requestData.driver_notes = formData.driver_notes;
        }

        if (formData.experience_details) {
          requestData.experience_details = formData.experience_details;
        }

        result = await assignmentRequestService.createRequest(
          requestData,
          car.owner_id!,
          profile!.id
        );
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error("Error submitting request:", err);
      setError(err.message || t("driveRequests.submitError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNoEndDateChange = (checked: boolean) => {
    setNoEndDate(checked);
    if (checked) {
      // Clear end date when checkbox is checked
      setFormData((prev) => ({
        ...prev,
        available_end_date: "",
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {currentRequest
            ? t("driveRequests.editRequest")
            : t("driveRequests.requestToDrive")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {car.make} {car.model} ({car.year})
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {checkingExisting ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {currentRequest && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                {t("driveRequests.existingRequestInfo")}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {currentRequest
                  ? t("driveRequests.updateSuccess")
                  : t("driveRequests.submitSuccess")}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Start Date */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  type="date"
                  label={t("driveRequests.startDate")}
                  value={formData.available_start_date}
                  onChange={(e) =>
                    handleChange("available_start_date", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                  inputProps={{
                    min: new Date().toISOString().split("T")[0],
                  }}
                />
              </Grid>

              {/* No End Date Checkbox */}
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={noEndDate}
                      onChange={(e) => handleNoEndDateChange(e.target.checked)}
                    />
                  }
                  label={t("driveRequests.noEndDate")}
                />
              </Grid>

              {/* End Date */}
              {!noEndDate && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t("driveRequests.endDate")}
                    value={formData.available_end_date}
                    onChange={(e) =>
                      handleChange("available_end_date", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    helperText={t("driveRequests.endDateHelper")}
                    inputProps={{
                      min: formData.available_start_date || undefined,
                    }}
                  />
                </Grid>
              )}

              {/* Max Hours Per Week */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("driveRequests.maxHoursPerWeek")}
                  value={formData.max_hours_per_week}
                  onChange={(e) =>
                    handleChange("max_hours_per_week", e.target.value)
                  }
                  helperText={t("driveRequests.maxHoursHelper")}
                  inputProps={{ min: 1, max: 168 }}
                />
              </Grid>

              {/* Driver Notes */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t("driveRequests.driverNotes")}
                  value={formData.driver_notes}
                  onChange={(e) => handleChange("driver_notes", e.target.value)}
                  helperText={t("driveRequests.driverNotesHelper")}
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>

              {/* Experience Details */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t("driveRequests.experienceDetails")}
                  value={formData.experience_details}
                  onChange={(e) =>
                    handleChange("experience_details", e.target.value)
                  }
                  helperText={t("driveRequests.experienceDetailsHelper")}
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || checkingExisting}
          sx={{
            textTransform: "none",
            minWidth: 120,
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : currentRequest ? (
            t("driveRequests.updateRequest")
          ) : (
            t("driveRequests.sendRequest")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriveRequestDialog;
