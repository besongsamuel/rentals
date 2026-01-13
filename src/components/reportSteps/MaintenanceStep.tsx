import { Box, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface MaintenanceStepProps {
  hasMaintenance: boolean;
  maintenanceAmount: number;
  currency: string;
  onMaintenanceChange: (hasMaintenance: boolean, amount: number) => void;
}

const MaintenanceStep: React.FC<MaintenanceStepProps> = ({
  hasMaintenance,
  maintenanceAmount,
  currency,
  onMaintenanceChange,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        {t("reports.maintenanceExpenses")}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={hasMaintenance}
              onChange={(e) => {
                const has = e.target.checked;
                onMaintenanceChange(has, has ? maintenanceAmount : 0);
              }}
              color="primary"
            />
          }
          label={
            <Typography variant="body1">
              {t("reports.hadMaintenanceExpenses")}
            </Typography>
          }
        />

        {hasMaintenance && (
          <TextField
            fullWidth
            label={t("reports.maintenanceExpenses")}
            type="number"
            value={maintenanceAmount || ""}
            onChange={(e) => {
              const amount = parseFloat(e.target.value) || 0;
              onMaintenanceChange(true, amount);
            }}
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: (
                <Box component="span" sx={{ mr: 1, color: "text.secondary" }}>
                  {currency}
                </Box>
              ),
            }}
            helperText={t("reports.maintenanceExpensesHelper")}
            required
          />
        )}

        {!hasMaintenance && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t("reports.noMaintenanceExpenses")}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MaintenanceStep;
