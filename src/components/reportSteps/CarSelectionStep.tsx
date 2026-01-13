import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Car } from "../../types";

interface CarSelectionStepProps {
  cars: Car[];
  selectedCarId: string;
  onCarChange: (carId: string) => void;
  userType?: "driver" | "owner";
}

const CarSelectionStep: React.FC<CarSelectionStepProps> = ({
  cars,
  selectedCarId,
  onCarChange,
  userType = "driver",
}) => {
  const { t } = useTranslation();

  if (cars.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {t("reports.noCarsAvailable")}
        </Typography>
      </Box>
    );
  }

  if (cars.length === 1) {
    // Auto-select if only one car
    if (!selectedCarId && cars[0].id) {
      onCarChange(cars[0].id);
    }
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          {t("reports.selectedCar")}
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgba(46, 125, 50, 0.05)",
            border: "1px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {cars[0].year} {cars[0].make} {cars[0].model}
          </Typography>
          {cars[0].license_plate && (
            <Typography variant="body2" color="text.secondary">
              {t("cars.licensePlate")}: {cars[0].license_plate}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        {t("reports.selectCar")}
      </Typography>
      <FormControl fullWidth required>
        <InputLabel>{t("cars.title")}</InputLabel>
        <Select
          value={selectedCarId}
          onChange={(e) => onCarChange(e.target.value)}
          label={t("cars.title")}
        >
          {cars.map((car) => (
            <MenuItem key={car.id} value={car.id}>
              {car.year} {car.make} {car.model}
              {car.license_plate && ` - ${car.license_plate}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CarSelectionStep;
