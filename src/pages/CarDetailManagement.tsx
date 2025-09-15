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
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CarOwnerForm from "../components/CarOwnerForm";
import IncomeSourceModal from "../components/IncomeSourceModal";
import { useUserContext } from "../contexts/UserContext";
import { carOwnerService } from "../services/carOwnerService";
import { carService } from "../services/carService";
import { profileService } from "../services/profileService";
import { weeklyReportService } from "../services/weeklyReportService";
import { Car, CarOwnerWithProfile, Profile, WeeklyReport } from "../types";

const CarDetailManagement: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useUserContext();
  const [car, setCar] = useState<Car | null>(null);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [carOwners, setCarOwners] = useState<CarOwnerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [showCarOwnerForm, setShowCarOwnerForm] = useState(false);

  useEffect(() => {
    if (carId) {
      loadData();
    }
  }, [carId, selectedYear, selectedMonth]);

  const loadData = async () => {
    if (!carId) return;

    setLoading(true);
    try {
      // Load car details, drivers, weekly reports, and car owners in parallel
      const [carData, driversData, reportsData, ownersData] = await Promise.all(
        [
          carService.getCarById(carId),
          profileService.getAllDrivers(profile?.organization_id),
          weeklyReportService.getReportsByCar(
            carId,
            selectedYear || undefined,
            selectedMonth || undefined
          ),
          carOwnerService.getCarOwnersByCar(carId),
        ]
      );

      setCar(carData);
      setDrivers(driversData);
      setWeeklyReports(reportsData || []);
      setCarOwners(ownersData || []);
      setSelectedDriverId(carData?.driver_id || "");
    } catch (error) {
      console.error("Error loading car details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!car || !selectedDriverId) return;

    setLoadingAssignments(true);
    try {
      await carService.assignCarToDriver(car.id, selectedDriverId, user!.id);
      await loadData(); // Refresh the data
      setSelectedDriverId(""); // Reset selection
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

  const handleDriverSelectionChange = (driverId: string) => {
    setSelectedDriverId(driverId);
  };

  const handleApproveReport = async (reportId: string) => {
    if (!user?.id) return;

    try {
      await weeklyReportService.approveReport(reportId, user.id);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error approving report:", error);
      alert(
        error instanceof Error ? error.message : "Failed to approve report"
      );
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      await weeklyReportService.submitReport(reportId);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(error instanceof Error ? error.message : "Failed to submit report");
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
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleViewDetails = (report: WeeklyReport) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReport(null);
  };

  const handleAddCarOwner = async (carOwnerData: any) => {
    try {
      await carOwnerService.addCarOwner(carOwnerData);
      setShowCarOwnerForm(false);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error adding car owner:", error);
      alert("Failed to add car owner");
    }
  };

  const handleRemoveCarOwner = async (carOwnerId: string) => {
    if (!window.confirm("Are you sure you want to remove this car owner?"))
      return;

    try {
      await carOwnerService.removeCarOwner(carOwnerId);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error removing car owner:", error);
      alert("Failed to remove car owner");
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

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "warning";
      case "submitted":
        return "info";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getCurrentDriver = () => {
    if (!car?.driver_id) return null;
    return drivers.find((driver) => driver.id === car.driver_id);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  const clearFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
    ];
    return months;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!car) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Car Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The requested car could not be found.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentDriver = getCurrentDriver();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
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
              <Typography variant="h4">
                {car.year} {car.make} {car.model} - Management
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/cars/${carId}/edit`)}
                >
                  Edit Car
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/cars/${carId}/reports`)}
                >
                  View Reports
                </Button>
                <Button variant="outlined" onClick={() => navigate("/")}>
                  Back to Dashboard
                </Button>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
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
              <Chip
                label={car.status}
                color={getStatusColor(car.status) as any}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Driver Assignment Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Driver Assignment
              </Typography>

              {currentDriver ? (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Currently Assigned Driver:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body1">
                      {currentDriver.full_name || currentDriver.email}
                    </Typography>
                    <Chip label="Assigned" color="primary" size="small" />
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={handleUnassignDriver}
                      disabled={loadingAssignments}
                    >
                      Unassign
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    No driver currently assigned
                  </Typography>
                </Box>
              )}

              <FormControl fullWidth size="small">
                <Select
                  value={selectedDriverId}
                  onChange={(e) => handleDriverSelectionChange(e.target.value)}
                  disabled={loadingAssignments}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select a driver</em>
                  </MenuItem>
                  {drivers
                    .filter((driver) => driver.id !== car.driver_id)
                    .map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.full_name || driver.email}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {selectedDriverId && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAssignDriver}
                    disabled={loadingAssignments}
                  >
                    Confirm Assignment
                  </Button>
                </Box>
              )}

              {loadingAssignments && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Updating driver assignment...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Car Owner Management Section */}
        {user && car && car.owner_id === user.id && (
          <Grid size={12}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Car Owners Management</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setShowCarOwnerForm(true)}
                  >
                    Add Owner
                  </Button>
                </Box>

                {carOwners.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No additional owners assigned to this car.
                  </Typography>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Owners:
                    </Typography>
                    {carOwners.map((carOwner) => (
                      <Box
                        key={carOwner.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box>
                          <Typography variant="body2">
                            {carOwner.profiles?.full_name ||
                              carOwner.profiles?.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ownership: {carOwner.ownership_percentage}%
                            {carOwner.is_primary_owner && " (Primary)"}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveCarOwner(carOwner.id)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}

                {showCarOwnerForm && (
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <CarOwnerForm
                      carId={carId!}
                      onSubmit={handleAddCarOwner}
                      onCancel={() => setShowCarOwnerForm(false)}
                      existingOwners={[
                        car.owner_id!,
                        ...carOwners.map((co) => co.owner_id),
                      ]}
                      organizationId={profile?.organization_id}
                    />
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Weekly Reports Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Reports
              </Typography>

              {/* Filters */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={6}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(e.target.value as number | "")
                      }
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>All Years</em>
                      </MenuItem>
                      {generateYearOptions().map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={6}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(e.target.value as number | "")
                      }
                      displayEmpty
                      disabled={!selectedYear}
                    >
                      <MenuItem value="">
                        <em>All Months</em>
                      </MenuItem>
                      {generateMonthOptions().map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                    disabled={!selectedYear && !selectedMonth}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary">
                Found {weeklyReports.length} report(s)
                {selectedYear && selectedMonth && (
                  <>
                    {" "}
                    for {generateMonthOptions()[selectedMonth - 1]?.label}{" "}
                    {selectedYear}
                  </>
                )}
                {selectedYear && !selectedMonth && <> for {selectedYear}</>}
                {!selectedYear && <> (all time)</>}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Reports Table */}
        <Grid size={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Reports Details
              </Typography>

              {weeklyReports.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No weekly reports found for the selected period.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Week Period</TableCell>
                        <TableCell>Driver</TableCell>
                        <TableCell align="right">Start Mileage</TableCell>
                        <TableCell align="right">End Mileage</TableCell>
                        <TableCell align="right">Driver Earnings</TableCell>
                        <TableCell align="right">Maintenance</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weeklyReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            {new Date(
                              report.week_start_date
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              report.week_end_date
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {drivers.find((d) => d.id === report.driver_id)
                              ?.full_name ||
                              drivers.find((d) => d.id === report.driver_id)
                                ?.email ||
                              "Unknown Driver"}
                          </TableCell>
                          <TableCell align="right">
                            {report.start_mileage.toLocaleString()} KM
                          </TableCell>
                          <TableCell align="right">
                            {report.end_mileage.toLocaleString()} KM
                          </TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "XAF",
                            }).format(report.driver_earnings)}
                          </TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "XAF",
                            }).format(report.maintenance_expenses)}
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={report.status}
                                color={
                                  getReportStatusColor(report.status) as any
                                }
                                size="small"
                              />
                              {user && report.status === "submitted" && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleApproveReport(report.id)}
                                >
                                  Approve
                                </Button>
                              )}
                              {user && report.status === "draft" && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleSubmitReport(report.id)}
                                >
                                  Submit
                                </Button>
                              )}
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDetails(report)}
                                sx={{ ml: 1 }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <IncomeSourceModal
        open={modalOpen}
        onClose={handleCloseModal}
        weeklyReport={selectedReport}
        userType="owner"
      />
    </Container>
  );
};

export default CarDetailManagement;
