import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { weeklyReportService } from "../services/weeklyReportService";
import { WeeklyReport } from "../types";
import IncomeSourceModal from "./IncomeSourceModal";

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
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
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

  const handleApproveReport = async (reportId: string) => {
    if (!currentUserId) return;

    try {
      await weeklyReportService.approveReport(reportId, currentUserId);
      onRefresh(); // Refresh the data
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
      onRefresh(); // Refresh the data
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(error instanceof Error ? error.message : "Failed to submit report");
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
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewDetails(report)}
                  >
                    View Details
                  </Button>
                  {userType === "driver" && report.status === "draft" && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSubmitReport(report.id)}
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

      <IncomeSourceModal
        open={modalOpen}
        onClose={handleCloseModal}
        weeklyReport={selectedReport}
        userType={userType}
      />
    </Box>
  );
};

export default WeeklyReportList;
