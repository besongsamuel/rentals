import { ArrowBack, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
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
  InputLabel,
  MenuItem,
  Paper,
  Rating,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import CarOwners from "../components/CarOwners";
import CarReportsExpensesTabs from "../components/CarReportsExpensesTabs";
import CarStatistics from "../components/CarStatistics";
import DriverAssignment from "../components/DriverAssignment";
import EarningsDetailsDialog from "../components/EarningsDetailsDialog";
import MissingWeeksDialog from "../components/MissingWeeksDialog";
import { useUserContext } from "../contexts/UserContext";
import { supabase } from "../lib/supabase";
import {
  assignmentService,
  TerminationReason,
} from "../services/assignmentService";
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
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const [missingWeeksOpen, setMissingWeeksOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminationReason, setTerminationReason] =
    useState<TerminationReason>("contract_completed");
  const [terminationNotes, setTerminationNotes] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [anonymousRating, setAnonymousRating] = useState<boolean>(false);
  const [terminating, setTerminating] = useState<boolean>(false);
  const [carStatisticsRefreshKey, setCarStatisticsRefreshKey] = useState(0);
  const [isCoOwner, setIsCoOwner] = useState(false);

  const isAssignedDriver =
    profile?.user_type === "driver" && car?.driver_id === profile.id;
  const isMainOwner =
    profile?.user_type === "owner" && car?.owner_id === profile.id;
  const showWeeklyReportShortcuts = isAssignedDriver || isMainOwner;
  const canAddCarExpense =
    showWeeklyReportShortcuts ||
    (profile?.user_type === "owner" && isCoOwner);
  const canApproveCarExpenses =
    profile?.user_type === "owner" && (isMainOwner || isCoOwner);

  useEffect(() => {
    const checkCoOwner = async () => {
      if (!car?.id || !profile?.id || profile.user_type !== "owner") {
        setIsCoOwner(false);
        return;
      }
      if (car.owner_id === profile.id) {
        setIsCoOwner(false);
        return;
      }
      const { data, error } = await supabase
        .from("car_owners")
        .select("id")
        .eq("car_id", car.id)
        .eq("owner_id", profile.id)
        .maybeSingle();
      if (error) {
        console.error("Error checking car co-ownership:", error);
        setIsCoOwner(false);
        return;
      }
      setIsCoOwner(!!data);
    };
    checkCoOwner();
  }, [car?.id, car?.owner_id, profile?.id, profile?.user_type]);

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
        // Submit report. If the submitter is the car owner, auto-approve immediately
        const submitted = await weeklyReportService.submitReport(
          confirmAction.reportId
        );
        if (
          profile?.user_type === "owner" &&
          submitted?.car_id &&
          car?.id === submitted.car_id
        ) {
          await weeklyReportService.approveReport(
            confirmAction.reportId,
            user.id
          );
        }
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
    navigate(`/reports/add?car_id=${carId}`);
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
    navigate(`/reports/edit/${report.id}`);
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

  const clearFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4">
                {car.year} {car.make} {car.model} - Management
              </Typography>
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

            {/* Action Buttons moved to bottom of card */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1,
                mt: 2,
              }}
            >
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
              {profile?.user_type === "owner" && car?.driver_id && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => setTerminateOpen(true)}
                >
                  {t("carManagement.terminateContract")}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Driver Assignment Section - Only show for owners */}
        {profile?.user_type === "owner" && (
          <Grid size={12}>
            <DriverAssignment currentUser={profile!} carId={carId!} />
          </Grid>
        )}

        {/* Car Owners Section */}
        <Grid size={12}>
          <CarOwners currentUser={profile!} carId={carId!} />
        </Grid>

        {/* Car Statistics Section */}
        <Grid size={12}>
          <CarStatistics
            carId={carId!}
            statisticsRefreshKey={carStatisticsRefreshKey}
          />
        </Grid>

        <CarReportsExpensesTabs
          carId={carId!}
          canAddExpense={canAddCarExpense}
          canApproveCarExpenses={canApproveCarExpenses}
          onExpensesChanged={() =>
            setCarStatisticsRefreshKey((key) => key + 1)
          }
          weeklyReports={weeklyReports}
          reportsWithIncomeSources={reportsWithIncomeSources}
          profile={profile}
          user={user}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onClearFilters={clearFilters}
          showWeeklyReportShortcuts={showWeeklyReportShortcuts}
          onAddNewReport={handleAddNewReport}
          onOpenMissingWeeks={() => setMissingWeeksOpen(true)}
          onViewEarnings={handleViewEarnings}
          onEditReport={handleEditReport}
          onApproveReport={handleApproveReport}
          onSubmitReport={handleSubmitReport}
        />
      </Grid>


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

      <MissingWeeksDialog
        open={missingWeeksOpen}
        onClose={() => setMissingWeeksOpen(false)}
        carId={carId || null}
        cars={car ? [car] : []}
      />

      {/* Terminate/Complete Contract Dialog */}
      <Dialog
        open={terminateOpen}
        onClose={() => setTerminateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("carManagement.terminateDialogTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("carManagement.terminateDialogDescription")}
          </DialogContentText>

          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel id="termination-reason-label">
                  {t("carManagement.terminationReason")}
                </InputLabel>
                <Select
                  labelId="termination-reason-label"
                  value={terminationReason}
                  label={t("carManagement.terminationReason")}
                  onChange={(e) =>
                    setTerminationReason(e.target.value as TerminationReason)
                  }
                >
                  <MenuItem value="contract_completed">
                    Contract completed
                  </MenuItem>
                  <MenuItem value="mutual_agreement">Mutual agreement</MenuItem>
                  <MenuItem value="owner_terminated">Owner terminated</MenuItem>
                  <MenuItem value="driver_terminated">
                    Driver terminated
                  </MenuItem>
                  <MenuItem value="violation_of_terms">
                    Violation of terms
                  </MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label={t("carManagement.terminationNotes")}
                value={terminationNotes}
                onChange={(e) => setTerminationNotes(e.target.value)}
                multiline
                minRows={3}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("carManagement.ratingLabel")} ({rating})
              </Typography>
              <Rating
                name="driver-rating"
                value={rating}
                onChange={(_, newValue) => setRating((newValue || 0) as number)}
                size="large"
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Switch
                  checked={wouldRecommend}
                  onChange={(e) => setWouldRecommend(e.target.checked)}
                />
                <Typography>{t("carManagement.wouldRecommend")}</Typography>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Switch
                  checked={anonymousRating}
                  onChange={(e) => setAnonymousRating(e.target.checked)}
                />
                <Typography>{t("carManagement.anonymousRating")}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminateOpen(false)}>
            {t("carManagement.cancel")}
          </Button>
          <Button
            variant="contained"
            disabled={terminating}
            onClick={async () => {
              try {
                if (!profile?.id || !car?.id || !car.driver_id) return;
                setTerminating(true);
                const assignment =
                  await assignmentService.getActiveAssignmentByCar(car.id);
                if (!assignment?.id)
                  throw new Error("Active assignment not found");

                // End contract (unassigns driver and creates termination)
                await assignmentService.terminateContract({
                  car_assignment_id: assignment.id,
                  termination_reason: terminationReason,
                  termination_notes: terminationNotes || undefined,
                });

                // Create rating
                const ratingRes = await assignmentService.createDriverRating({
                  driver_id: car.driver_id,
                  rater_id: profile.id,
                  car_id: car.id,
                  car_assignment_id: assignment.id,
                  rating,
                  comment: terminationNotes || undefined,
                  categories: undefined,
                  would_recommend: wouldRecommend,
                  is_anonymous: anonymousRating,
                  rating_type: "contract_completion",
                });

                if (ratingRes?.id) {
                  await assignmentService.markRatingProvided(
                    assignment.id,
                    ratingRes.id
                  );
                }

                setTerminateOpen(false);
                // Refresh details
                loadData();
              } catch (err) {
                console.error("Terminate contract failed", err);
                alert(
                  err instanceof Error
                    ? err.message
                    : "Failed to terminate contract"
                );
              } finally {
                setTerminating(false);
              }
            }}
          >
            {t("carManagement.submitTermination")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarDetailManagement;
