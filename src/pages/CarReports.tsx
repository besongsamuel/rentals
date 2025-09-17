import {
  Add,
  ArrowBack,
  AttachMoney,
  Edit,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import EarningsDetailsDialog from "../components/EarningsDetailsDialog";
import WeeklyReportDialog from "../components/WeeklyReportDialog";
import WeeklyReportsTable from "../components/WeeklyReportsTable";
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
  const [weeklyReports, setWeeklyReports] = useState<
    (WeeklyReport & { total_earnings: number })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>("");
  const [reportsWithIncomeSources, setReportsWithIncomeSources] = useState<
    Set<string>
  >(new Set());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    week_start_date: "",
    week_end_date: "",
    start_mileage: 0,
    end_mileage: 0,
    driver_earnings: 0,
    maintenance_expenses: 0,
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "submit" | "approve";
    reportId: string;
  } | null>(null);

  useEffect(() => {
    if (carId) {
      loadData();
    }
  }, [carId, selectedYear, selectedMonth]);

  // Check which reports have income sources
  useEffect(() => {
    const checkIncomeSources = async () => {
      const reportsWithSources = new Set<string>();

      for (const report of weeklyReports) {
        if (report.status === "draft") {
          const hasSources = await weeklyReportService.hasIncomeSources(
            report.id
          );
          if (hasSources) {
            reportsWithSources.add(report.id);
          }
        }
      }

      setReportsWithIncomeSources(reportsWithSources);
    };

    if (weeklyReports.length > 0) {
      checkIncomeSources();
    }
  }, [weeklyReports]);

  const loadData = async () => {
    if (!carId) return;

    setLoading(true);
    try {
      // Load car details, drivers, and weekly reports in parallel
      const [carData, driversData, reportsData] = await Promise.all([
        carService.getCarById(carId),
        profileService.getAllDrivers(),
        weeklyReportService.getReportsByCarWithTotalEarnings(
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

  const handleApproveReport = (reportId: string) => {
    setConfirmAction({ type: "approve", reportId });
    setConfirmDialogOpen(true);
  };

  const handleSubmitReport = (reportId: string) => {
    setConfirmAction({ type: "submit", reportId });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || !user?.id) return;

    try {
      if (confirmAction.type === "approve") {
        await weeklyReportService.approveReport(
          confirmAction.reportId,
          user.id
        );
      } else if (confirmAction.type === "submit") {
        await weeklyReportService.submitReport(confirmAction.reportId);
      }
      loadData(); // Refresh the data
    } catch (error) {
      console.error(`Error ${confirmAction.type}ing report:`, error);
      alert(
        error instanceof Error
          ? error.message
          : `Failed to ${confirmAction.type} report`
      );
    } finally {
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const handleBackToCar = () => {
    navigate(`/cars/${carId}`);
  };

  const handleViewEarnings = (report: WeeklyReport) => {
    setSelectedReport(report);
    setEarningsDialogOpen(true);
  };

  const handleDriverFilterChange = (driverId: string) => {
    setSelectedDriverFilter(driverId);
  };

  const handleCloseEarningsDialog = () => {
    setEarningsDialogOpen(false);
    setSelectedReport(null);
  };

  const handleEditReport = (report: WeeklyReport) => {
    setEditingReport(report);
    setEditFormData({
      week_start_date: report.week_start_date,
      week_end_date: report.week_end_date,
      start_mileage: report.start_mileage,
      end_mileage: report.end_mileage,
      driver_earnings: report.driver_earnings,
      maintenance_expenses: report.maintenance_expenses,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingReport(null);
    setEditFormData({
      week_start_date: "",
      week_end_date: "",
      start_mileage: 0,
      end_mileage: 0,
      driver_earnings: 0,
      maintenance_expenses: 0,
    });
  };

  const handleEditInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleUpdateReport = async () => {
    if (!editingReport) return;

    try {
      await weeklyReportService.updateReport(editingReport.id, {
        week_start_date: editFormData.week_start_date,
        week_end_date: editFormData.week_end_date,
        start_mileage: editFormData.start_mileage,
        end_mileage: editFormData.end_mileage,
        driver_earnings: editFormData.driver_earnings,
        maintenance_expenses: editFormData.maintenance_expenses,
      });
      handleCloseEditDialog();
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error updating report:", error);
      alert(error instanceof Error ? error.message : "Failed to update report");
    }
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
                {profile?.user_type === "owner" && (
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
                )}
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
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <WeeklyReportsTable
                      weeklyReports={weeklyReports}
                      reportsWithIncomeSources={reportsWithIncomeSources}
                      profile={profile}
                      user={user}
                      onViewDetails={handleViewEarnings}
                      onEditReport={handleEditReport}
                      onApproveReport={handleApproveReport}
                      onSubmitReport={handleSubmitReport}
                    />
                  </Box>

                  {/* Mobile Cards */}
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    {weeklyReports
                      .filter((report) =>
                        selectedDriverFilter
                          ? report.driver_id === selectedDriverFilter
                          : true
                      )
                      .map((report) => (
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
                                    disabled={
                                      !reportsWithIncomeSources.has(report.id)
                                    }
                                    title={
                                      !reportsWithIncomeSources.has(report.id)
                                        ? "Add income sources before submitting"
                                        : ""
                                    }
                                  >
                                    {t("reports.submit")}
                                  </Button>
                                )}
                              {report.status === "draft" && (
                                <Tooltip title="Edit report">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditReport(report)}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                        borderColor: "primary.main",
                                      },
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="View earnings details">
                                <IconButton
                                  size="small"
                                  sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    "&:hover": {
                                      bgcolor: "action.hover",
                                      borderColor: "primary.main",
                                    },
                                  }}
                                >
                                  <AttachMoney />
                                </IconButton>
                              </Tooltip>
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
      </Grid>

      {/* Weekly Report Dialog */}
      <WeeklyReportDialog
        open={showAddReportForm}
        onClose={() => setShowAddReportForm(false)}
        onSubmit={handleAddReport}
        assignedCars={car ? [car] : []}
        editingReport={null}
        mode="add"
      />

      {/* Edit Report Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Weekly Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  required
                  fullWidth
                  label="Week Start Date"
                  type="date"
                  value={editFormData.week_start_date}
                  onChange={handleEditInputChange("week_start_date")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  required
                  fullWidth
                  label="Week End Date"
                  type="date"
                  value={editFormData.week_end_date}
                  onChange={handleEditInputChange("week_end_date")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  required
                  fullWidth
                  label="Start Mileage"
                  type="number"
                  value={editFormData.start_mileage}
                  onChange={handleEditInputChange("start_mileage")}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  required
                  fullWidth
                  label="End Mileage"
                  type="number"
                  value={editFormData.end_mileage}
                  onChange={handleEditInputChange("end_mileage")}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Driver Earnings"
                  type="number"
                  value={editFormData.driver_earnings}
                  onChange={handleEditInputChange("driver_earnings")}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="XAF"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Maintenance Expenses"
                  type="number"
                  value={editFormData.maintenance_expenses}
                  onChange={handleEditInputChange("maintenance_expenses")}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="XAF"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateReport} variant="contained">
            Update Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelAction}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">
          {confirmAction?.type === "approve"
            ? "Approve Report"
            : "Submit Report"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {confirmAction?.type === "approve"
              ? "Are you sure you want to approve this weekly report? This action cannot be undone."
              : "Are you sure you want to submit this weekly report? Once submitted, you won't be able to edit it."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmAction?.type === "approve" ? "success" : "primary"}
            variant="contained"
            autoFocus
          >
            {confirmAction?.type === "approve" ? "Approve" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Earnings Details Dialog */}
      <EarningsDetailsDialog
        open={earningsDialogOpen}
        onClose={handleCloseEarningsDialog}
        weeklyReport={selectedReport}
      />
    </Container>
  );
};

export default CarReports;
