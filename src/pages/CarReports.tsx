import {
  Add,
  ArrowBack,
  FilterList,
  Home,
  Settings,
} from "@mui/icons-material";
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
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
            {t("errors.carNotFound")}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t("errors.carNotFoundMessage")}
          </Typography>
          <Button variant="outlined" onClick={handleBackToDashboard}>
            {t("dashboard.title")}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 4 },
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Grid container spacing={3}>
        {/* Header */}
        <Grid size={12}>
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Back Button */}
              <Box sx={{ mb: 2 }}>
                <Tooltip title={t("common.back")}>
                  <IconButton onClick={handleBackToCar} sx={{ mb: 2 }}>
                    <ArrowBack />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {car.year} {car.make} {car.model}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                {t("reports.title")}
              </Typography>

              {/* Car Details */}
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>VIN:</strong> {car.vin}
                </Typography>
                {car.license_plate && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>License:</strong> {car.license_plate}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("cars.currentMileage")}:</strong>{" "}
                  {car.current_mileage.toLocaleString()} {t("common.km")}
                </Typography>
              </Stack>

              {/* Action Buttons */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", justifyContent: "flex-start" }}
              >
                {profile?.user_type === "driver" && (
                  <Tooltip title={t("reports.addReport")}>
                    <IconButton
                      color="primary"
                      onClick={() => setShowAddReportForm(true)}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t("cars.manage")}>
                  <IconButton
                    onClick={handleBackToCar}
                    color="primary"
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    <Settings />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("dashboard.title")}>
                  <IconButton
                    onClick={handleBackToDashboard}
                    color="primary"
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    <Home />
                  </IconButton>
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Filters */}
        <Grid size={12}>
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <FilterList color="primary" />
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {t("reports.filter")}
                </Typography>
              </Stack>

              <Grid container spacing={2}>
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
                        <em>{t("reports.allYears")}</em>
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
                        <em>{t("reports.allMonths")}</em>
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
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={clearFilters}
                      disabled={!selectedYear && !selectedMonth}
                    >
                      {t("reports.clearFilters")}
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {t("reports.found", { count: weeklyReports.length })}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Reports Table */}
        <Grid size={12}>
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                {t("reports.details")}
              </Typography>

              {weeklyReports.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {t("reports.noReports")}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Desktop Table */}
                  <TableContainer
                    sx={{
                      display: { xs: "none", md: "block" },
                      "& .MuiTable-root": {
                        minWidth: 650,
                      },
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("reports.weekPeriod")}</TableCell>
                          <TableCell>{t("reports.driver")}</TableCell>
                          <TableCell align="right">
                            {t("reports.startMileage")}
                          </TableCell>
                          <TableCell align="right">
                            {t("reports.endMileage")}
                          </TableCell>
                          <TableCell align="right">
                            {t("reports.driverEarnings")}
                          </TableCell>
                          <TableCell align="right">
                            {t("reports.maintenance")}
                          </TableCell>
                          <TableCell>{t("reports.status")}</TableCell>
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
                                      {t("reports.approve")}
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
                                      {t("reports.submit")}
                                    </Button>
                                  )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleViewDetails(report)}
                                  sx={{ ml: 1 }}
                                >
                                  {t("reports.viewDetails")}
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Mobile Cards */}
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    {weeklyReports.map((report) => (
                      <Card key={report.id} sx={{ mb: 2, p: 2 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              {t("reports.weekPeriod")}
                            </Typography>
                            <Typography variant="body2">
                              {new Date(
                                report.week_start_date
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                report.week_end_date
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              {t("reports.driver")}
                            </Typography>
                            <Typography variant="body2">
                              {drivers.find((d) => d.id === report.driver_id)
                                ?.full_name ||
                                drivers.find((d) => d.id === report.driver_id)
                                  ?.email ||
                                "Unknown Driver"}
                            </Typography>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid size={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {t("reports.startMileage")}
                              </Typography>
                              <Typography variant="body2">
                                {report.start_mileage.toLocaleString()}{" "}
                                {t("common.km")}
                              </Typography>
                            </Grid>
                            <Grid size={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {t("reports.endMileage")}
                              </Typography>
                              <Typography variant="body2">
                                {report.end_mileage.toLocaleString()}{" "}
                                {t("common.km")}
                              </Typography>
                            </Grid>
                          </Grid>

                          <Grid container spacing={2}>
                            <Grid size={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {t("reports.driverEarnings")}
                              </Typography>
                              <Typography variant="body2">
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: "XAF",
                                }).format(report.driver_earnings)}
                              </Typography>
                            </Grid>
                            <Grid size={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {t("reports.maintenance")}
                              </Typography>
                              <Typography variant="body2">
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: "XAF",
                                }).format(report.maintenance_expenses)}
                              </Typography>
                            </Grid>
                          </Grid>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Chip
                              label={report.status}
                              color={getReportStatusColor(report.status) as any}
                              size="small"
                            />
                            {profile?.user_type === "owner" &&
                              report.status === "submitted" && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleApproveReport(report.id)}
                                >
                                  {t("reports.approve")}
                                </Button>
                              )}
                            {profile?.user_type === "driver" &&
                              report.status === "draft" && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleSubmitReport(report.id)}
                                >
                                  {t("reports.submit")}
                                </Button>
                              )}
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewDetails(report)}
                            >
                              {t("reports.viewDetails")}
                            </Button>
                          </Box>
                        </Stack>
                      </Card>
                    ))}
                  </Box>
                </>
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
