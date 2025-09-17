import { PersonAdd, PersonRemove } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { carService } from "../services/carService";
import { profileService } from "../services/profileService";
import { Car, Profile } from "../types";

interface DriverAssignmentProps {
  currentUser: Profile;
  carId: string;
}

const DriverAssignment: React.FC<DriverAssignmentProps> = ({
  currentUser,
  carId,
}) => {
  const { t } = useTranslation();
  const [car, setCar] = useState<Car | null>(null);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<Profile | null>(null);

  const isMainOwner = car?.owner_id === currentUser.id;
  const currentDriver = drivers.find((driver) => driver.id === car?.driver_id);

  useEffect(() => {
    loadData();
  }, [carId]);

  const loadData = async () => {
    if (!carId) return;

    setLoading(true);
    try {
      const [carData, driversData] = await Promise.all([
        carService.getCarById(carId),
        profileService.getAllDrivers(currentUser.organization_id),
      ]);

      setCar(carData);
      setDrivers(driversData);
      setSelectedDriverId(carData?.driver_id || "");

      // Set the selected driver object if there's a current driver
      if (carData?.driver_id) {
        const driver = driversData.find((d) => d.id === carData.driver_id);
        setSelectedDriver(driver || null);
      }
    } catch (error) {
      console.error("Error loading driver assignment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!car || !selectedDriverId) return;

    setLoadingAssignments(true);
    try {
      await carService.assignCarToDriver(
        car.id,
        selectedDriverId,
        currentUser.id
      );
      await loadData(); // Refresh the data
      setSelectedDriverId(""); // Reset selection
      setSelectedDriver(null);
    } catch (error) {
      console.error("Error assigning car to driver:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to assign car to driver"
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleUnassignDriver = async () => {
    if (!car) return;

    setLoadingAssignments(true);
    try {
      await carService.unassignCar(car.id);
      await loadData(); // Refresh the data
    } catch (error) {
      console.error("Error unassigning car:", error);
      alert(error instanceof Error ? error.message : "Failed to unassign car");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleDriverChange = (
    event: any,
    newValue: string | Profile | null
  ) => {
    if (typeof newValue === "string") {
      // Handle free text input
      setSelectedDriver(null);
      setSelectedDriverId("");
    } else {
      // Handle Profile selection
      setSelectedDriver(newValue);
      setSelectedDriverId(newValue?.id || "");
    }
  };

  const handleDriverInputChange = (event: any, newInputValue: string) => {
    // Handle free text input if needed
    if (!newInputValue) {
      setSelectedDriver(null);
      setSelectedDriverId("");
    }
  };

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!car) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Car not found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("carManagement.driverAssignment")}
        </Typography>

        {/* Current Driver Display */}
        {currentDriver ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("carManagement.currentlyAssignedDriver")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {currentDriver.full_name || currentDriver.email}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {currentDriver.email}
                  </Typography>
                  {currentDriver.phone && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {currentDriver.phone}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={t("carManagement.assigned")}
                  color="primary"
                  size="small"
                />
              </Box>
              {isMainOwner && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleUnassignDriver}
                  disabled={loadingAssignments}
                >
                  {loadingAssignments ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PersonRemove />
                  )}
                </IconButton>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("carManagement.noDriverAssigned")}
            </Typography>
          </Box>
        )}

        {/* Driver Assignment Form - Only for main owners */}
        {isMainOwner && (
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {t("carManagement.selectDriver")}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  options={drivers.filter(
                    (driver) => driver.id !== car.driver_id
                  )}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option.full_name || option.email;
                  }}
                  value={selectedDriver}
                  onChange={handleDriverChange}
                  onInputChange={handleDriverInputChange}
                  disabled={loadingAssignments}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("carManagement.selectDriver")}
                      placeholder={t("carManagement.selectDriver")}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {option.full_name || option.email}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {option.email}
                        </Typography>
                        {option.phone && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {option.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>

            {selectedDriverId && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PersonAdd />}
                  onClick={handleAssignDriver}
                  disabled={loadingAssignments}
                >
                  {t("carManagement.confirmAssignment")}
                </Button>
                {loadingAssignments && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption">
                      {t("carManagement.updatingDriverAssignment")}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverAssignment;
