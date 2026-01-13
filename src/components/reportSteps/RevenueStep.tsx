import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type RevenueType = "rideshare" | "rental" | "taxi";

interface RevenueStepProps {
  rideShareIncome: number;
  rentalIncome: number;
  taxiIncome: number;
  currency: string;
  onRevenueChange: (type: RevenueType, amount: number) => void;
}

const RevenueStep: React.FC<RevenueStepProps> = ({
  rideShareIncome,
  rentalIncome,
  taxiIncome,
  currency,
  onRevenueChange,
}) => {
  const { t } = useTranslation();
  const [currentType, setCurrentType] = useState<RevenueType>("rideshare");

  const revenueTypes: { type: RevenueType; label: string; helper: string }[] = [
    {
      type: "rideshare",
      label: t("reports.rideShareIncome"),
      helper: t("reports.rideShareIncomeHelper"),
    },
    {
      type: "rental",
      label: t("reports.rentalIncome"),
      helper: t("reports.rentalIncomeHelper"),
    },
    {
      type: "taxi",
      label: t("reports.taxiIncome"),
      helper: t("reports.taxiIncomeHelper"),
    },
  ];

  const currentIndex = revenueTypes.findIndex((r) => r.type === currentType);
  const currentRevenue = revenueTypes[currentIndex];

  const getCurrentValue = () => {
    switch (currentType) {
      case "rideshare":
        return rideShareIncome;
      case "rental":
        return rentalIncome;
      case "taxi":
        return taxiIncome;
      default:
        return 0;
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % revenueTypes.length;
    setCurrentType(revenueTypes[nextIndex].type);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + revenueTypes.length) % revenueTypes.length;
    setCurrentType(revenueTypes[prevIndex].type);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        {t("reports.revenue")}
      </Typography>

      {/* Revenue Type Indicator */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        {revenueTypes.map((revenue, index) => (
          <Box
            key={revenue.type}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor:
                currentType === revenue.type
                  ? "primary.main"
                  : "rgba(0,0,0,0.05)",
              color:
                currentType === revenue.type ? "white" : "text.secondary",
              fontSize: "0.875rem",
              fontWeight: currentType === revenue.type ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => setCurrentType(revenue.type)}
          >
            {revenue.label}
          </Box>
        ))}
      </Box>

      {/* Current Revenue Input */}
      <Box
        sx={{
          position: "relative",
          mb: 3,
        }}
      >
        <TextField
          fullWidth
          label={currentRevenue.label}
          type="number"
          value={getCurrentValue() || ""}
          onChange={(e) => {
            const amount = parseFloat(e.target.value) || 0;
            onRevenueChange(currentType, amount);
          }}
          inputProps={{ min: 0, step: 0.01 }}
          InputProps={{
            startAdornment: (
              <Box component="span" sx={{ mr: 1, color: "text.secondary" }}>
                {currency}
              </Box>
            ),
          }}
          helperText={currentRevenue.helper}
          required
        />

        {/* Navigation Arrows */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            gap: 2,
          }}
        >
          <Button
            onClick={handlePrevious}
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            {t("common.previous")}
          </Button>
          <Button
            onClick={handleNext}
            endIcon={<ArrowForward />}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            {t("common.next")}
          </Button>
        </Box>
      </Box>

      {/* Summary */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          background: "rgba(37, 99, 235, 0.02)",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t("reports.totalRevenue")}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {currency}{" "}
          {(rideShareIncome || 0) + (rentalIncome || 0) + (taxiIncome || 0)}
        </Typography>
      </Box>
    </Box>
  );
};

export default RevenueStep;
