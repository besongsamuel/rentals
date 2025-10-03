import { DirectionsCar } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { CarData } from "../services/carImageExtraction";

interface CarExtractionPreviewDialogProps {
  open: boolean;
  loading: boolean;
  extractedData: CarData | null;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const CarExtractionPreviewDialog: React.FC<CarExtractionPreviewDialogProps> = ({
  open,
  loading,
  extractedData,
  onAccept,
  onReject,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("car.extractionPreview.title")}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t("car.extractionPreview.analyzing")}
            </Typography>
          </Box>
        ) : extractedData ? (
          <>
            <DialogContentText sx={{ mb: 2 }}>
              {t("car.extractionPreview.description")}
            </DialogContentText>

            {/* Car Information */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <DirectionsCar color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  {t("car.extractionPreview.carInfo")}
                </Typography>
              </Box>
            </Grid>

            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>{t("car.make")}:</strong>{" "}
                  {extractedData.make || t("common.notProvided")}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>{t("car.model")}:</strong>{" "}
                  {extractedData.model || t("common.notProvided")}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2">
                  <strong>{t("car.licensePlate")}:</strong>{" "}
                  {extractedData.license_plate || t("common.notProvided")}
                </Typography>
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              {t("car.extractionPreview.dataQuality")}
            </Typography>
          </>
        ) : (
          <DialogContentText>
            {t("car.extractionPreview.noData")}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onReject} color="error">
          {t("common.reject")}
        </Button>
        <Button
          onClick={onAccept}
          color="primary"
          variant="contained"
          disabled={!extractedData}
        >
          {t("common.accept")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarExtractionPreviewDialog;
