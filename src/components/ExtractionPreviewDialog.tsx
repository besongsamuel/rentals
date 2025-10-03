import { CheckCircle, Close, CreditCard, Person } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { DriversLicenseData } from "../services/imageExtraction";

interface ExtractionPreviewDialogProps {
  open: boolean;
  loading: boolean;
  extractedData: DriversLicenseData | null;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const ExtractionPreviewDialog: React.FC<ExtractionPreviewDialogProps> = ({
  open,
  loading,
  extractedData,
  onAccept,
  onReject,
  onClose,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("common.notProvided");
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getFieldValue = (value: string | null) => {
    return value || t("common.notProvided");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CreditCard color="primary" />
          <Typography variant="h6" component="div">
            {t("profile.extractionPreview.title")}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {t("profile.extractingLicenseData")}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              {t("profile.extractionPreview.analyzing")}
            </Typography>
          </Box>
        ) : extractedData ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("profile.extractionPreview.description")}
            </Typography>

            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Person color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t("profile.extractionPreview.personalInfo")}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t("profile.firstName")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {getFieldValue(extractedData.first_name)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t("profile.lastName")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {getFieldValue(extractedData.last_name)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>

              {/* License Information */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <CreditCard color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t("profile.extractionPreview.licenseInfo")}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t("profile.licenseNumber")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {getFieldValue(extractedData.license_number)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t("profile.licenseClass")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {getFieldValue(extractedData.license_class)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t("profile.licenseIssueDate")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(extractedData.issue_date)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t("profile.licenseExpiryDate")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(extractedData.expiry_date)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t("profile.issuingAuthority")}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {getFieldValue(extractedData.issuing_authority)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Data Quality Indicator */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircle color="success" />
                  <Typography variant="body2" color="text.secondary">
                    {t("profile.extractionPreview.dataQuality")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <Close color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {t("profile.extractionPreview.noData")}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onReject} color="inherit" disabled={loading}>
          {t("common.reject")}
        </Button>
        <Button
          onClick={onAccept}
          variant="contained"
          disabled={loading || !extractedData}
          startIcon={<CheckCircle />}
        >
          {t("common.accept")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtractionPreviewDialog;
