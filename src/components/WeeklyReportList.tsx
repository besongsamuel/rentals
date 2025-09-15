import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { weeklyReportService } from "../services/weeklyReportService";
import { WeeklyReport } from "../types";

interface WeeklyReportListProps {
  reports: WeeklyReport[];
  onRefresh: () => void;
  currentUserId?: string;
  userType?: string;
}

const WeeklyReportList: React.FC<WeeklyReportListProps> = ({
  reports,
  onRefresh,
  currentUserId,
  userType,
}) => {
  const [reportsWithIncomeSources, setReportsWithIncomeSources] = useState<
    Set<string>
  >(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "submit" | "approve";
    reportId: string;
  } | null>(null);

  // Check which reports have income sources
  useEffect(() => {
    const checkIncomeSources = async () => {
      const reportsWithSources = new Set<string>();

      for (const report of reports) {
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

    if (reports.length > 0) {
      checkIncomeSources();
    }
  }, [reports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "default";
      case "submitted":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
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
    if (!confirmAction || !currentUserId) return;

    try {
      if (confirmAction.type === "approve") {
        await weeklyReportService.approveReport(
          confirmAction.reportId,
          currentUserId
        );
      } else if (confirmAction.type === "submit") {
        await weeklyReportService.submitReport(confirmAction.reportId);
      }
      onRefresh(); // Refresh the data
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

  const handleEditReport = (report: WeeklyReport) => {
    // TODO: Implement edit functionality
    console.log("Edit report:", report);
    // For now, just show an alert
    alert("Edit functionality will be implemented");
  };

  if (reports.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Reports
        </Typography>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No reports found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first weekly report to get started
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Weekly Reports ({reports.length})
      </Typography>
      <Grid container spacing={2}>
        {reports.map((report) => (
          <Grid key={report.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                  <Typography variant="h6" component="div">
                    Week of {formatDate(report.week_start_date)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={report.status}
                      color={getStatusColor(report.status) as any}
                      size="small"
                    />
                    {userType === "owner" && report.status === "submitted" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleApproveReport(report.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {userType === "driver" && report.status === "draft" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleSubmitReport(report.id)}
                        disabled={!reportsWithIncomeSources.has(report.id)}
                        title={
                          !reportsWithIncomeSources.has(report.id)
                            ? "Add income sources before submitting"
                            : ""
                        }
                      >
                        Submit
                      </Button>
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mileage: {report.start_mileage.toLocaleString()} -{" "}
                  {report.end_mileage.toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Driver Earnings: {formatCurrency(report.driver_earnings)}
                </Typography>

                {report.maintenance_expenses > 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Maintenance: {formatCurrency(report.maintenance_expenses)}
                  </Typography>
                )}

                {report.submitted_at && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Submitted: {formatDate(report.submitted_at)}
                  </Typography>
                )}

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Button size="small" variant="outlined">
                    Details
                  </Button>
                  {userType === "driver" && report.status === "draft" && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSubmitReport(report.id)}
                      disabled={!reportsWithIncomeSources.has(report.id)}
                      title={
                        !reportsWithIncomeSources.has(report.id)
                          ? "Add income sources before submitting"
                          : ""
                      }
                    >
                      Submit
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WeeklyReportList;
