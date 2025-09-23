import { AttachMoney, Comment, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Profile, WeeklyReport } from "../types";
import EarningsDetailsDialog from "./EarningsDetailsDialog";
import MessagesManager from "./MessagesManager";

interface WeeklyReportsTableProps {
  weeklyReports: WeeklyReport[];
  onEditReport?: (report: WeeklyReport) => void;
  onApproveReport?: (reportId: string) => void;
  onSubmitReport?: (reportId: string) => void;
  onViewDetails?: (report: WeeklyReport) => void;
  user: any;
  profile: Profile | null;
  reportsWithIncomeSources: Set<string>;
}

const WeeklyReportsTable: React.FC<WeeklyReportsTableProps> = ({
  weeklyReports,
  onEditReport,
  onApproveReport,
  onSubmitReport,
  onViewDetails,
  user,
  profile,
  reportsWithIncomeSources,
}) => {
  const { t } = useTranslation();
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [selectedReportForMessages, setSelectedReportForMessages] =
    useState<WeeklyReport | null>(null);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(
    new Set()
  );

  const handleViewEarnings = (report: WeeklyReport) => {
    if (onViewDetails) {
      onViewDetails(report);
    } else {
      setSelectedReport(report);
      setEarningsDialogOpen(true);
    }
  };

  const handleViewMessages = (report: WeeklyReport) => {
    setSelectedReportForMessages(report);
    setMessagesDialogOpen(true);
  };

  const handleCloseEarningsDialog = () => {
    setEarningsDialogOpen(false);
    setSelectedReport(null);
  };

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const getReportStatusColor = (status: string) => {
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

  // Mobile Card Component
  const MobileReportCard: React.FC<{ report: WeeklyReport }> = ({ report }) => {
    const rideShareIncome = (report as any).ride_share_income || 0;
    const rentalIncome = (report as any).rental_income || 0;
    const taxiIncome = (report as any).taxi_income || 0;
    const totalIncome = rideShareIncome + rentalIncome + taxiIncome;
    const maintenanceExpenses = report.maintenance_expenses || 0;
    const gasExpense = report.gas_expense || 0;
    const totalExpenses = maintenanceExpenses + gasExpense;
    const totalMileage = report.end_mileage - report.start_mileage;
    const isExpanded = expandedReports.has(report.id);

    return (
      <Card
        sx={{
          mb: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
        }}
      >
        {/* Header - Always Visible */}
        <CardContent sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              cursor: "pointer",
            }}
            onClick={() => toggleReportExpansion(report.id)}
          >
            <Box sx={{ flex: 1 }}>
              {/* Week Period */}
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {new Date(report.week_start_date).toLocaleDateString()} -{" "}
                {new Date(report.week_end_date).toLocaleDateString()}
              </Typography>

              {/* Status and Summary */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Chip
                  label={report.status}
                  color={getReportStatusColor(report.status) as any}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    textTransform: "capitalize",
                    "& .MuiChip-label": {
                      fontSize: "0.75rem",
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {totalMileage.toLocaleString()} km •{" "}
                  {totalIncome.toLocaleString()} {t("common.currency")} income
                </Typography>
              </Box>
            </Box>

            {/* Expand/Collapse Icon */}
            <IconButton
              size="small"
              sx={{
                ml: 1,
                transition: "transform 0.2s ease",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <ExpandMore />
            </IconButton>
          </Box>

          {/* Draft Reminder for Drivers */}
          {report.status === "draft" && profile?.user_type === "driver" && (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                borderRadius: 1,
                borderLeft: "4px solid #ffc107",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "warning.dark",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
              >
                {t("reports.draftReminder")}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Collapsible Details */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>
            {/* Mileage */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("reports.mileage")}
              </Typography>
              <Typography variant="body2" color="info.main" fontWeight={600}>
                {report.start_mileage.toLocaleString()} →{" "}
                {report.end_mileage.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="info.main">
                {totalMileage.toLocaleString()} {t("common.km")} total
              </Typography>
            </Box>

            {/* Incomes */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("reports.incomes")}
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                {totalIncome.toLocaleString()} {t("common.currency")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                {rideShareIncome > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Ride: {rideShareIncome.toLocaleString()}
                  </Typography>
                )}
                {rentalIncome > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Rental: {rentalIncome.toLocaleString()}
                  </Typography>
                )}
                {taxiIncome > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Taxi: {taxiIncome.toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Expenses */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("reports.expenses")}
              </Typography>
              <Typography variant="body2" color="error.main" fontWeight={600}>
                {totalExpenses.toLocaleString()} {t("common.currency")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                {maintenanceExpenses > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Maint: {maintenanceExpenses.toLocaleString()}
                  </Typography>
                )}
                {gasExpense > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Gas: {gasExpense.toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Driver Earnings */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("reports.driverEarnings")}
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                {report.driver_earnings.toLocaleString()} {t("common.currency")}
              </Typography>
            </Box>
          </CardContent>
        </Collapse>

        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Box
            sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: "100%" }}
          >
            {/* Action Buttons */}
            {onEditReport &&
              report.status === "draft" &&
              profile?.user_type === "driver" && (
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => onEditReport(report)}
                  sx={{
                    color: "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      bgcolor: "rgba(37, 99, 235, 0.08)",
                    },
                  }}
                >
                  {t("common.edit")}
                </Button>
              )}

            <Button
              size="small"
              startIcon={<AttachMoney />}
              onClick={() => handleViewEarnings(report)}
              sx={{
                color: "success.main",
                borderColor: "success.main",
                "&:hover": {
                  bgcolor: "rgba(5, 150, 105, 0.08)",
                },
              }}
            >
              {t("reports.viewEarnings")}
            </Button>

            <Button
              size="small"
              startIcon={<Comment />}
              onClick={() => handleViewMessages(report)}
              sx={{
                color: "info.main",
                borderColor: "info.main",
                "&:hover": {
                  bgcolor: "rgba(37, 99, 235, 0.08)",
                },
              }}
            >
              {t("reports.viewComments")}
            </Button>

            {/* Status Action Buttons */}
            {user &&
              profile?.user_type === "owner" &&
              report.status === "submitted" &&
              onApproveReport && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => onApproveReport(report.id)}
                  sx={{
                    fontWeight: 500,
                    textTransform: "none",
                    ml: "auto",
                  }}
                >
                  {t("reports.approve")}
                </Button>
              )}

            {user &&
              profile?.user_type === "driver" &&
              report.status === "draft" &&
              onSubmitReport && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => onSubmitReport(report.id)}
                  disabled={!reportsWithIncomeSources.has(report.id)}
                  title={
                    !reportsWithIncomeSources.has(report.id)
                      ? "Add income sources before submitting"
                      : ""
                  }
                  sx={{
                    fontWeight: 500,
                    textTransform: "none",
                    ml: "auto",
                  }}
                >
                  {t("reports.submit")}
                </Button>
              )}
          </Box>
        </CardActions>
      </Card>
    );
  };

  if (weeklyReports.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          px: 2,
          backgroundColor: "#f8fafc",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t("reports.noReportsFound")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("reports.noReportsMessage")}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Card Layout for All Screen Sizes */}
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        {weeklyReports.map((report) => (
          <MobileReportCard key={report.id} report={report} />
        ))}
      </Box>

      {/* Earnings Details Dialog */}
      <EarningsDetailsDialog
        open={earningsDialogOpen}
        onClose={handleCloseEarningsDialog}
        weeklyReport={selectedReport}
      />

      {/* Messages Manager Dialog */}
      {selectedReportForMessages && profile && (
        <MessagesManager
          weeklyReportId={selectedReportForMessages.id}
          currentUser={profile}
          open={messagesDialogOpen}
          onClose={() => {
            setMessagesDialogOpen(false);
            setSelectedReportForMessages(null);
          }}
        />
      )}
    </>
  );
};

export default WeeklyReportsTable;
