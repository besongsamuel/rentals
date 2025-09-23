import { Add } from "@mui/icons-material";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
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
  const [showAddReportDialog, setShowAddReportDialog] = useState(false);
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
      setShowAddReportDialog(false);
      // Reload data to show the new report
      await loadData();
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const handleEditReport = async (report: WeeklyReport) => {
    // For now, just close the dialog - edit functionality can be added later
    console.log("Edit report:", report);
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
                onClick={() => setShowAddReportDialog(true)}
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
                  onClick={() => setShowAddReportDialog(true)}
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
        open={showAddReportDialog}
        onClose={() => setShowAddReportDialog(false)}
        onSubmit={handleAddReport}
        assignedCars={assignedCars}
        editingReport={null}
        mode="add"
      />
    </Box>
  );
};

export default DriverDashboard;
