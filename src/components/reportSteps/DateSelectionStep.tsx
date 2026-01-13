import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, TextField, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { navigateWeek } from "../../utils/dateHelpers";

interface DateSelectionStepProps {
  weekStartDate: string;
  weekEndDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  weekStartDate,
  weekEndDate,
  onDateChange,
}) => {
  const { t } = useTranslation();

  const handleWeekNavigation = (direction: "prev" | "next") => {
    if (weekStartDate) {
      const newWeek = navigateWeek(weekStartDate, direction);
      onDateChange(newWeek.start, newWeek.end);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
        {t("reports.selectWeek")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("reports.selectWeekHelper")}
      </Typography>

      {/* Week Navigation */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
          p: 2,
          background: "rgba(37, 99, 235, 0.02)",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            color: "text.primary",
            fontWeight: 600,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          {t("reports.weekPeriod")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <Button
            onClick={() => handleWeekNavigation("prev")}
            size="small"
            startIcon={<ChevronLeft />}
            variant="outlined"
            sx={{
              minWidth: "auto",
              flex: { xs: 1, sm: "none" },
            }}
          >
            {t("reports.previousWeek")}
          </Button>
          <Button
            onClick={() => handleWeekNavigation("next")}
            size="small"
            endIcon={<ChevronRight />}
            variant="outlined"
            sx={{
              minWidth: "auto",
              flex: { xs: 1, sm: "none" },
            }}
          >
            {t("reports.nextWeek")}
          </Button>
        </Box>
      </Box>

      {/* Date Inputs */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          label={t("reports.weekStart")}
          type="date"
          value={weekStartDate}
          onChange={(e) => {
            const start = e.target.value;
            // Calculate end date (6 days after start)
            const startDate = new Date(start);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            const end = endDate.toISOString().split("T")[0];
            onDateChange(start, end);
          }}
          InputLabelProps={{ shrink: true }}
          helperText={t("reports.weekStartHelper")}
          required
        />
        <TextField
          fullWidth
          label={t("reports.weekEnd")}
          type="date"
          value={weekEndDate}
          onChange={(e) => {
            const end = e.target.value;
            // Calculate start date (6 days before end)
            const endDate = new Date(end);
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);
            const start = startDate.toISOString().split("T")[0];
            onDateChange(start, end);
          }}
          InputLabelProps={{ shrink: true }}
          helperText={t("reports.weekEndHelper")}
          required
        />
      </Box>
    </Box>
  );
};

export default DateSelectionStep;
