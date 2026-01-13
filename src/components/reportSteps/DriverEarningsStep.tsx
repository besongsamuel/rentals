import { Box, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface DriverEarningsStepProps {
  driverEarnings: number;
  currency: string;
  onDriverEarningsChange: (amount: number) => void;
}

const DriverEarningsStep: React.FC<DriverEarningsStepProps> = ({
  driverEarnings,
  currency,
  onDriverEarningsChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        {t("reports.driverEarnings")}
      </Typography>

      <TextField
        fullWidth
        label={t("reports.driverEarnings")}
        type="number"
        value={driverEarnings || ""}
        onChange={(e) => {
          const amount = parseFloat(e.target.value) || 0;
          onDriverEarningsChange(amount);
        }}
        inputProps={{ min: 0, step: 0.01 }}
        InputProps={{
          startAdornment: (
            <Box component="span" sx={{ mr: 1, color: "text.secondary" }}>
              {currency}
            </Box>
          ),
        }}
        helperText={t("reports.driverEarningsHelper")}
        required
      />
    </Box>
  );
};

export default DriverEarningsStep;
