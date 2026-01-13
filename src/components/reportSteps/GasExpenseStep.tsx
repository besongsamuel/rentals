import { Box, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface GasExpenseStepProps {
  gasExpense: number;
  currency: string;
  onGasExpenseChange: (amount: number) => void;
}

const GasExpenseStep: React.FC<GasExpenseStepProps> = ({
  gasExpense,
  currency,
  onGasExpenseChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
        {t("reports.gasExpense")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("reports.gasExpenseStepHelper")}
      </Typography>

      <TextField
        fullWidth
        label={t("reports.gasExpense")}
        type="number"
        value={gasExpense || ""}
        onChange={(e) => {
          const amount = parseFloat(e.target.value) || 0;
          onGasExpenseChange(amount);
        }}
        inputProps={{ min: 0, step: 0.01 }}
        InputProps={{
          startAdornment: (
            <Box component="span" sx={{ mr: 1, color: "text.secondary" }}>
              {currency}
            </Box>
          ),
        }}
        helperText={t("reports.gasExpenseHelper")}
        required
      />
    </Box>
  );
};

export default GasExpenseStep;
