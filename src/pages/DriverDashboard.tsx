import { Add } from "@mui/icons-material";
import { Alert, Box, Button, Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BasicInformation from "../components/BasicInformation";
import DriverDetail from "../components/DriverDetail";
import SkeletonLoader from "../components/SkeletonLoader";
import WeeklyReportDialog from "../components/WeeklyReportDialog";
import WeeklyReportsTable from "../components/WeeklyReportsTable";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { driverDetailsService } from "../services/driverDetailsService";
import { weeklyReportService } from "../services/weeklyReportService";
import {
  Car,
  CreateWeeklyReportData,
  DriverDetails,
  WeeklyReport,
} from "../types";

const DriverDashboard: React.FC = () => {
  const { profile } = useUserContext();
  const { t } = useTranslation();
  const [assignedCars, setAssignedCars] = useState<Car[]>([]);
  const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(
    null
  );
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [reportsWithIncomeSources, setReportsWithIncomeSources] = useState<
    Set<string>
  >(new Set());
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Load assigned cars
      const carsData = await carService.getCarsByDriver(profile.id);
      setAssignedCars(carsData);

      // Load driver details
      const detailsData = await driverDetailsService.getDriverDetails(
        profile.id
      );
      setDriverDetails(detailsData);

      // Load weekly reports
      const reportsData = await weeklyReportService.getReportsByDriver(
        profile.id
      );
      setWeeklyReports(reportsData);

      // Check which reports have income sources
      const reportsWithIncome = new Set<string>();
      for (const report of reportsData) {
        const hasIncome = await weeklyReportService.hasIncomeSources(report.id);
        if (hasIncome) {
          reportsWithIncome.add(report.id);
        }
      }
      setReportsWithIncomeSources(reportsWithIncome);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id, loadData]);

  const handleAddReport = async (reportData: CreateWeeklyReportData) => {
    if (!profile?.id) return;

    try {
      await weeklyReportService.createReport({
        ...reportData,
        driver_id: profile.id,
      });
      setShowReportDialog(false);
      // Reload data to show the new report
      await loadData();
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const handleEditReport = (report: WeeklyReport) => {
    setEditingReport(report);
    setDialogMode("edit");
    setShowReportDialog(true);
  };

  const handleUpdateReport = async (reportData: CreateWeeklyReportData) => {
    if (!editingReport) return;
    try {
      await weeklyReportService.updateReport(editingReport.id, {
        car_id: reportData.car_id,
        week_start_date: reportData.week_start_date,
        week_end_date: reportData.week_end_date,
        start_mileage: reportData.start_mileage,
        end_mileage: reportData.end_mileage,
        driver_earnings: reportData.driver_earnings,
        maintenance_expenses: reportData.maintenance_expenses,
        gas_expense: (reportData as any).gas_expense ?? 0,
        // Additional optional incomes if provided
        ride_share_income: (reportData as any).ride_share_income ?? 0,
        rental_income: (reportData as any).rental_income ?? 0,
        taxi_income: (reportData as any).taxi_income ?? 0,
        currency: (reportData as any).currency ?? "XAF",
      } as Partial<WeeklyReport>);
      setShowReportDialog(false);
      setEditingReport(null);
      await loadData();
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      await weeklyReportService.submitReport(reportId);
      // Reload data to show updated status
      await loadData();
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  if (loading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  return (
    <Box sx={{ py: { xs: 3, sm: 4 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 400,
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: "#1D1D1F",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {t("dashboard.driverDashboard")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            color: "#86868B",
            fontSize: { xs: "1rem", sm: "1.125rem" },
            letterSpacing: "-0.01em",
          }}
        >
          {t("dashboard.driverDashboardDescription")}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Summary Section */}
        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: "#ffffff",
              border: "0.5px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 400,
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              {t("dashboard.profileSummary")}
            </Typography>

            <Grid container spacing={3}>
              {/* Basic Profile Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <BasicInformation profile={profile} />
              </Grid>

              {/* Driver Details Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <DriverDetail driverDetails={driverDetails} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* No Assigned Cars Alert */}
        {assignedCars.length === 0 && (
          <Grid size={12}>
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t("dashboard.noAssignedCarsTitle")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("dashboard.noAssignedCarsMessage")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.noAssignedCarsInstructions")}
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Weekly Reports Section */}
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 400 }}>
                {t("reports.weeklyReports")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setDialogMode("add");
                  setEditingReport(null);
                  setShowReportDialog(true);
                }}
                sx={{
                  minWidth: { xs: "100%", sm: "auto" },
                  order: { xs: -1, sm: 0 },
                }}
              >
                {t("reports.addReport")}
              </Button>
            </Box>

            {weeklyReports.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {t("reports.noReportsMessage")}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    setDialogMode("add");
                    setEditingReport(null);
                    setShowReportDialog(true);
                  }}
                >
                  {t("reports.addFirstReport")}
                </Button>
              </Box>
            ) : (
              <WeeklyReportsTable
                weeklyReports={weeklyReports}
                onEditReport={handleEditReport}
                onSubmitReport={handleSubmitReport}
                user={profile}
                profile={profile}
                reportsWithIncomeSources={reportsWithIncomeSources}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Weekly Report Dialog */}
      <WeeklyReportDialog
        open={showReportDialog}
        onClose={() => {
          setShowReportDialog(false);
          setEditingReport(null);
          setDialogMode("add");
        }}
        onSubmit={dialogMode === "add" ? handleAddReport : handleUpdateReport}
        assignedCars={assignedCars}
        editingReport={editingReport}
        mode={dialogMode}
        existingReports={weeklyReports}
        userType={profile?.user_type}
        currentUserId={profile?.id}
      />
    </Box>
  );
};

export default DriverDashboard;
