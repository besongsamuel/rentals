import { Add, ArrowBack, Edit } from "@mui/icons-material";
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
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import CarOwners from "../components/CarOwners";
import CarStatistics from "../components/CarStatistics";
import DriverAssignment from "../components/DriverAssignment";
import EarningsDetailsDialog from "../components/EarningsDetailsDialog";
import WeeklyReportDialog from "../components/WeeklyReportDialog";
import WeeklyReportsTable from "../components/WeeklyReportsTable";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { weeklyReportService } from "../services/weeklyReportService";
import { Car, WeeklyReport } from "../types";

const CarDetailManagement: React.FC = () => {
  const { t } = useTranslation();
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useUserContext();
  const [car, setCar] = useState<Car | null>(null);
  const [weeklyReports, setWeeklyReports] = useState<
    (WeeklyReport & { total_earnings: number })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");
  const [reportsWithIncomeSources, setReportsWithIncomeSources] = useState<
    Set<string>
  >(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "submit" | "approve";
    reportId: string;
  } | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );

  const loadData = useCallback(async () => {
    if (!carId) return;

    setLoading(true);
    try {
      // Load car details and weekly reports in parallel
      const [carData, reportsData] = await Promise.all([
        carService.getCarById(carId),
        weeklyReportService.getReportsByCarWithTotalEarnings(
          carId,
          selectedYear || undefined,
          selectedMonth || undefined
        ),
      ]);

      setCar(carData);
      setWeeklyReports(reportsData || []);
    } catch (error) {
      console.error("Error loading car details:", error);
    } finally {
      setLoading(false);
    }
  }, [carId, selectedYear, selectedMonth]);

  useEffect(() => {
    if (carId) {
      loadData();
    }
  }, [carId, selectedYear, selectedMonth, loadData]);

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

  const handleAddNewReport = () => {
    setEditingReport(null);
    setShowReportDialog(true);
  };

  const handleViewEarnings = (report: WeeklyReport) => {
    setSelectedReport(report);
    setEarningsDialogOpen(true);
  };

  const handleCloseEarningsDialog = () => {
    setEarningsDialogOpen(false);
    setSelectedReport(null);
  };

  const handleEditReport = (report: WeeklyReport) => {
    setEditingReport(report);
    setShowReportDialog(true);
  };

  const handleReportSubmit = async (reportData: any) => {
    try {
      if (editingReport) {
        // Update existing report
        await weeklyReportService.updateReport(editingReport.id, reportData);
      } else {
        // Create new report
        if (!profile?.id) {
          throw new Error("Driver ID is required to create a report");
        }
        await weeklyReportService.createReport({
          ...reportData,
          driver_id: profile.id,
        });
      }
      setShowReportDialog(false);
      setEditingReport(null);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  const handleReportDialogClose = () => {
    setShowReportDialog(false);
    setEditingReport(null);
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
      { value: 1, label: t("months.january") },
      { value: 2, label: t("months.february") },
      { value: 3, label: t("months.march") },
      { value: 4, label: t("months.april") },
      { value: 5, label: t("months.may") },
      { value: 6, label: t("months.june") },
      { value: 7, label: t("months.july") },
      { value: 8, label: t("months.august") },
      { value: 9, label: t("months.september") },
      { value: 10, label: t("months.october") },
      { value: 11, label: t("months.november") },
      { value: 12, label: t("months.december") },
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

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title={t("carManagement.backToDashboard")}>
                  <IconButton
                    onClick={() => navigate("/")}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      boxShadow: 2,
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                </Tooltip>
                {profile?.user_type === "owner" && (
                  <Tooltip title={t("carManagement.editCar")}>
                    <IconButton
                      onClick={() => navigate(`/cars/${carId}/edit`)}
                      sx={{
                        bgcolor: "secondary.main",
                        color: "white",
                        "&:hover": { bgcolor: "secondary.dark" },
                        boxShadow: 2,
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                )}
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
              {car.fuel_type && (
                <Typography variant="body2" color="text.secondary">
                  Fuel:{" "}
                  {car.fuel_type.charAt(0).toUpperCase() +
                    car.fuel_type.slice(1)}
                </Typography>
              )}
              {car.transmission_type && (
                <Typography variant="body2" color="text.secondary">
                  Transmission:{" "}
                  {car.transmission_type.charAt(0).toUpperCase() +
                    car.transmission_type.slice(1)}
                </Typography>
              )}
              <Chip
                label={car.status}
                color={getStatusColor(car.status) as any}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Driver Assignment Section */}
        <Grid size={12}>
          <DriverAssignment currentUser={profile!} carId={carId!} />
        </Grid>

        {/* Car Owners Section */}
        <Grid size={12}>
          <CarOwners currentUser={profile!} carId={carId!} />
        </Grid>

        {/* Car Statistics Section */}
        <Grid size={12}>
          <CarStatistics carId={carId!} />
        </Grid>

        {/* Weekly Reports Filters Section */}
        <Grid size={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("reports.filterReports")}
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
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                    disabled={!selectedYear && !selectedMonth}
                  >
                    {t("reports.clearFilters")}
                  </Button>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary">
                {t("reports.found", { count: weeklyReports.length })}
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  {t("carManagement.weeklyReportsDetails")}
                </Typography>
                {profile?.user_type === "driver" && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddNewReport}
                    size="small"
                  >
                    {t("carManagement.addNewReport")}
                  </Button>
                )}
              </Box>

              <WeeklyReportsTable
                weeklyReports={weeklyReports}
                reportsWithIncomeSources={reportsWithIncomeSources}
                profile={profile}
                user={user}
                onViewDetails={handleViewEarnings}
                onEditReport={handleEditReport}
                onApproveReport={handleApproveReport}
                onSubmitReport={handleSubmitReport}
                getReportStatusColor={getReportStatusColor}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Report Dialog */}
      <WeeklyReportDialog
        open={showReportDialog}
        onClose={handleReportDialogClose}
        onSubmit={handleReportSubmit}
        assignedCars={car ? [car] : []}
        editingReport={editingReport}
        mode={editingReport ? "edit" : "add"}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelAction}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">
          {confirmAction?.type === "approve"
            ? t("carManagement.approveReport")
            : t("carManagement.submitReport")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {confirmAction?.type === "approve"
              ? t("carManagement.approveReportConfirm")
              : t("carManagement.submitReportConfirm")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction} color="primary">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmAction?.type === "approve" ? "success" : "primary"}
            variant="contained"
            autoFocus
          >
            {confirmAction?.type === "approve"
              ? t("reports.approve")
              : t("reports.submit")}
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

export default CarDetailManagement;
