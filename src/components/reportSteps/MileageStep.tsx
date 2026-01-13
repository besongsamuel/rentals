import { Box, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface MileageStepProps {
  startMileage: number;
  endMileage: number;
  onMileageChange: (start: number, end: number) => void;
}

const MileageStep: React.FC<MileageStepProps> = ({
  startMileage,
  endMileage,
  onMileageChange,
}) => {
  const { t } = useTranslation();

  const totalDistance = endMileage > startMileage ? endMileage - startMileage : 0;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        {t("reports.mileage")}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          label={t("reports.startMileage")}
          type="number"
          value={startMileage || ""}
          onChange={(e) => {
            const start = parseFloat(e.target.value) || 0;
            onMileageChange(start, endMileage);
          }}
          inputProps={{ min: 0, step: 1 }}
          helperText={t("reports.startMileageHelper")}
          required
        />
        <TextField
          fullWidth
          label={t("reports.endMileage")}
          type="number"
          value={endMileage || ""}
          onChange={(e) => {
            const end = parseFloat(e.target.value) || 0;
            onMileageChange(startMileage, end);
          }}
          inputProps={{ min: 0, step: 1 }}
          helperText={t("reports.endMileageHelper")}
          required
        />
      </Box>

      {startMileage > 0 && endMileage > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            background: "rgba(5, 150, 105, 0.02)",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {t("reports.totalDistance")}:{" "}
            <Box
              component="span"
              sx={{ color: "success.main", fontWeight: 600 }}
            >
              {totalDistance} {t("common.km")}
            </Box>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MileageStep;
