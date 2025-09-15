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
import AddWeeklyReportForm from "../components/AddWeeklyReportForm";
import IncomeSourceModal from "../components/IncomeSourceModal";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { profileService } from "../services/profileService";
import { weeklyReportService } from "../services/weeklyReportService";
import { Car, Profile, WeeklyReport } from "../types";

const CarReports: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useUserContext();
  const [car, setCar] = useState<Car | null>(null);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (carId) {
      loadData();
    }
  }, [carId, selectedYear, selectedMonth]);

  const loadData = async () => {
    if (!carId) return;

    setLoading(true);
    try {
      // Load car details, drivers, and weekly reports in parallel
      const [carData, driversData, reportsData] = await Promise.all([
        carService.getCarById(carId),
        profileService.getAllDrivers(profile?.organization_id),
        weeklyReportService.getReportsByCar(
          carId,
          selectedYear || undefined,
          selectedMonth || undefined
        ),
      ]);

      setCar(carData);
      setDrivers(driversData);
      setWeeklyReports(reportsData || []);
    } catch (error) {
      console.error("Error loading car reports:", error);
    } finally {
      setLoading(false);
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

  const handleAddReport = async (reportData: any) => {
    if (!profile?.id) return;

    try {
      await weeklyReportService.createReport({
        ...reportData,
        driver_id: profile.id,
      });
      setShowAddReportForm(false);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error adding report:", error);
    }
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

  const handleBackToCar = () => {
    navigate(`/cars/${carId}`);
  };

  const handleViewDetails = (report: WeeklyReport) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReport(null);
  };

  const handleBackToDashboard = () => {
    navigate("/");
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
          <Button variant="outlined" onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

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
                {car.year} {car.make} {car.model} - Weekly Reports
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                {profile?.user_type === "driver" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowAddReportForm(true)}
                  >
                    Add New Report
                  </Button>
                )}
                <Button variant="outlined" onClick={handleBackToCar}>
                  Back to Car Management
                </Button>
                <Button variant="outlined" onClick={handleBackToDashboard}>
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
            </Box>
          </Paper>
        </Grid>

        {/* Filters */}
        <Grid size={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filter Reports
              </Typography>

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
                              {profile?.user_type === "owner" &&
                                report.status === "submitted" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() =>
                                      handleApproveReport(report.id)
                                    }
                                  >
                                    Approve
                                  </Button>
                                )}
                              {profile?.user_type === "driver" &&
                                report.status === "draft" && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      handleSubmitReport(report.id)
                                    }
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

        {/* Add Weekly Report Form */}
        {showAddReportForm && (
          <Grid size={12}>
            <AddWeeklyReportForm
              onSubmit={handleAddReport}
              onCancel={() => setShowAddReportForm(false)}
              assignedCars={car ? [car] : []}
            />
          </Grid>
        )}
      </Grid>

      <IncomeSourceModal
        open={modalOpen}
        onClose={handleCloseModal}
        weeklyReport={selectedReport}
        userType={profile?.user_type}
      />
    </Container>
  );
};

export default CarReports;
