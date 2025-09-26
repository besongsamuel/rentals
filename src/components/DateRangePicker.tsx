import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  period:
    | "last_7_days"
    | "last_30_days"
    | "last_3_months"
    | "last_6_months"
    | "last_year"
    | "custom";
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handlePeriodChange = (period: string) => {
    const newRange: DateRange = {
      startDate: null,
      endDate: null,
      period: period as DateRange["period"],
    };

    const now = new Date();
    const endDate = new Date(now);

    switch (period) {
      case "last_7_days":
        newRange.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        newRange.endDate = endDate;
        break;
      case "last_30_days":
        newRange.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        newRange.endDate = endDate;
        break;
      case "last_3_months":
        newRange.startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        );
        newRange.endDate = endDate;
        break;
      case "last_6_months":
        newRange.startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate()
        );
        newRange.endDate = endDate;
        break;
      case "last_year":
        newRange.startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        newRange.endDate = endDate;
        break;
      case "custom":
        // Keep existing dates or set to null
        newRange.startDate = value.startDate;
        newRange.endDate = value.endDate;
        break;
    }

    onChange(newRange);
  };

  const handleStartDateChange = (date: Date | null) => {
    onChange({
      ...value,
      startDate: date,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onChange({
      ...value,
      endDate: date,
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        alignItems: { xs: "stretch", sm: "center" },
        mb: 3,
      }}
    >
      {/* Period Selector */}
      <FormControl
        size="small"
        sx={{
          minWidth: { xs: "100%", sm: 200 },
          order: { xs: 1, sm: 1 },
        }}
      >
        <InputLabel>Time Period</InputLabel>
        <Select
          value={value.period}
          label="Time Period"
          onChange={(e) => handlePeriodChange(e.target.value)}
          disabled={disabled}
        >
          <MenuItem value="last_7_days">Last 7 Days</MenuItem>
          <MenuItem value="last_30_days">Last 30 Days</MenuItem>
          <MenuItem value="last_3_months">Last 3 Months</MenuItem>
          <MenuItem value="last_6_months">Last 6 Months</MenuItem>
          <MenuItem value="last_year">Last Year</MenuItem>
          <MenuItem value="custom">Custom Range</MenuItem>
        </Select>
      </FormControl>

      {/* Custom Date Range */}
      {value.period === "custom" && (
        <>
          <TextField
            label="Start Date"
            type="date"
            value={
              value.startDate ? value.startDate.toISOString().split("T")[0] : ""
            }
            onChange={(e) =>
              handleStartDateChange(
                e.target.value ? new Date(e.target.value) : null
              )
            }
            disabled={disabled}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="End Date"
            type="date"
            value={
              value.endDate ? value.endDate.toISOString().split("T")[0] : ""
            }
            onChange={(e) =>
              handleEndDateChange(
                e.target.value ? new Date(e.target.value) : null
              )
            }
            disabled={disabled}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </>
      )}

      {/* Date Range Display */}
      {value.period !== "custom" && value.startDate && value.endDate && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            order: { xs: 2, sm: 2 },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {value.startDate.toLocaleDateString()} -{" "}
            {value.endDate.toLocaleDateString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DateRangePicker;
