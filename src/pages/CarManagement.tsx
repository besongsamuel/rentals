import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { profileService } from "../services/profileService";
import { Car, Profile } from "../types";

interface CarManagementProps {
  onBack?: () => void;
}

const CarManagement: React.FC<CarManagementProps> = ({ onBack }) => {
  const { user, profile } = useUserContext();
  const [cars, setCars] = useState<Car[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [owners, setOwners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState<string | null>(
    null
  );
  const [selectedDrivers, setSelectedDrivers] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Load cars, drivers, and owners in parallel
      const [carsData, driversData, ownersData] = await Promise.all([
        carService.getCarsByOwner(user.id),
        profileService.getAllDrivers(profile?.organization_id),
        profileService.getAllOwners(profile?.organization_id),
      ]);

      setCars(carsData);
      setDrivers(driversData);
      setOwners(ownersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOwner = async (carId: string, newOwnerId: string) => {
    setLoadingAssignments(carId);
    try {
      await carService.assignCarToOwner(carId, newOwnerId, user!.id);
      await loadData(); // Refresh the data
    } catch (error) {
      console.error("Error assigning car to owner:", error);
    } finally {
      setLoadingAssignments(null);
    }
  };

  const handleAssignDriver = async (carId: string) => {
    const driverId = selectedDrivers[carId];
    if (!driverId) return;

    setLoadingAssignments(carId);
    try {
      await carService.assignCarToDriver(carId, driverId, user!.id);
      await loadData(); // Refresh the data
      // Clear the selection for this car
      setSelectedDrivers((prev) => ({ ...prev, [carId]: "" }));
    } catch (error) {
      console.error("Error assigning car to driver:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to assign car to driver"
      );
    } finally {
      setLoadingAssignments(null);
    }
  };

  const handleDriverSelectionChange = (carId: string, driverId: string) => {
    setSelectedDrivers((prev) => ({ ...prev, [carId]: driverId }));
  };

  const handleUnassignDriver = async (carId: string) => {
    setLoadingAssignments(carId);
    try {
      await carService.unassignCar(carId);
      await loadData(); // Refresh the data
    } catch (error) {
      console.error("Error unassigning car:", error);
    } finally {
      setLoadingAssignments(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "assigned":
        return "primary";
      case "maintenance":
        return "warning";
      case "retired":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h4">Car Management</Typography>
              {onBack && (
                <Button variant="outlined" onClick={onBack}>
                  Back to Dashboard
                </Button>
              )}
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              Manage car ownership and driver assignments. Assign cars to other
              owners or drivers as needed.
            </Typography>
          </Paper>
        </Grid>

        {cars.length === 0 ? (
          <Grid size={12}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                No Cars Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any cars to manage yet.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          cars.map((car) => (
            <Grid key={car.id} size={12}>
              <Card elevation={2}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {car.year} {car.make} {car.model}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          VIN: {car.vin}
                        </Typography>
                        {car.license_plate && (
                          <Typography variant="body2" color="text.secondary">
                            License: {car.license_plate}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Mileage: {car.current_mileage.toLocaleString()} KM
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Chip
                        label={car.status}
                        color={getStatusColor(car.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    {/* Owner Assignment */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Owner Assignment
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Assign to Owner</InputLabel>
                        <Select
                          value={car.owner_id || ""}
                          onChange={(e) =>
                            handleAssignOwner(car.id, e.target.value)
                          }
                          disabled={loadingAssignments === car.id}
                        >
                          {owners.map((owner) => (
                            <MenuItem key={owner.id} value={owner.id}>
                              {owner.full_name || owner.email}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {loadingAssignments === car.id && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="caption">
                            Updating owner...
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    {/* Driver Assignment */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Driver Assignment
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={selectedDrivers[car.id] || ""}
                          onChange={(e) =>
                            handleDriverSelectionChange(car.id, e.target.value)
                          }
                          disabled={loadingAssignments === car.id}
                          displayEmpty
                        >
                          <MenuItem value="">
                            <em>Select a driver</em>
                          </MenuItem>
                          {drivers.map((driver) => (
                            <MenuItem key={driver.id} value={driver.id}>
                              {driver.full_name || driver.email}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {selectedDrivers[car.id] && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAssignDriver(car.id)}
                            disabled={loadingAssignments === car.id}
                          >
                            Confirm Assignment
                          </Button>
                        </Box>
                      )}
                      {loadingAssignments === car.id && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="caption">
                            Updating driver...
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default CarManagement;
