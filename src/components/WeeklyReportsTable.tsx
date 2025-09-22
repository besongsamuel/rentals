import { AttachMoney, Comment, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [selectedReportForMessages, setSelectedReportForMessages] =
    useState<WeeklyReport | null>(null);

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

    return (
      <Card
        sx={{
          mb: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Week Period */}
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {new Date(report.week_start_date).toLocaleDateString()} -{" "}
            {new Date(report.week_end_date).toLocaleDateString()}
          </Typography>

          {/* Status */}
          <Box sx={{ mb: 2 }}>
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
          </Box>

          {/* Mileage */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("reports.driverEarnings")}
            </Typography>
            <Typography variant="body2" color="success.main" fontWeight={600}>
              {report.driver_earnings.toLocaleString()} {t("common.currency")}
            </Typography>
          </Box>
        </CardContent>

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
          {t("reports.noReports")}
        </Typography>
      </Box>
    );
  }

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {onEditReport &&
            params.row.status === "draft" &&
            profile?.user_type === "driver" && (
              <Tooltip title="Edit report">
                <IconButton
                  size="small"
                  onClick={() => onEditReport(params.row)}
                  sx={{
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "rgba(37, 99, 235, 0.08)",
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
              onClick={() => handleViewEarnings(params.row)}
              sx={{
                color: "success.main",
                "&:hover": {
                  bgcolor: "rgba(5, 150, 105, 0.08)",
                },
              }}
            >
              <AttachMoney />
            </IconButton>
          </Tooltip>
          <Tooltip title="View comments">
            <IconButton
              size="small"
              onClick={() => handleViewMessages(params.row)}
              sx={{
                color: "info.main",
                "&:hover": {
                  bgcolor: "rgba(37, 99, 235, 0.08)",
                },
              }}
            >
              <Comment />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "weekPeriod",
      headerName: t("reports.weekPeriod"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={500}>
          {new Date(params.row.week_start_date).toLocaleDateString()} -{" "}
          {new Date(params.row.week_end_date).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "mileage",
      headerName: t("reports.mileage"),
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        const totalMileage = params.row.end_mileage - params.row.start_mileage;
        return (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              color="info.main"
              fontWeight={600}
              sx={{ mb: 0.5 }}
            >
              {params.row.start_mileage.toLocaleString()} →{" "}
              {params.row.end_mileage.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="info.main" fontWeight={500}>
              {totalMileage.toLocaleString()} {t("common.km")} total
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "incomes",
      headerName: t("reports.incomes"),
      width: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        const rideShareIncome = (params.row as any).ride_share_income || 0;
        const rentalIncome = (params.row as any).rental_income || 0;
        const taxiIncome = (params.row as any).taxi_income || 0;
        const totalIncome = rideShareIncome + rentalIncome + taxiIncome;

        return (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="success.main" fontWeight={600}>
              {totalIncome.toLocaleString()} {t("common.currency")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                flexWrap: "wrap",
                mt: 0.5,
              }}
            >
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
        );
      },
    },
    {
      field: "expenses",
      headerName: t("reports.expenses"),
      width: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        const maintenanceExpenses = params.row.maintenance_expenses || 0;
        const gasExpense = params.row.gas_expense || 0;
        const totalExpenses = maintenanceExpenses + gasExpense;

        return (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="error.main" fontWeight={600}>
              {totalExpenses.toLocaleString()} {t("common.currency")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                flexWrap: "wrap",
                mt: 0.5,
              }}
            >
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
        );
      },
    },
    {
      field: "driverEarnings",
      headerName: t("reports.driverEarnings"),
      width: 140,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="success.main" fontWeight={500}>
          {params.row.driver_earnings.toLocaleString()} {t("common.currency")}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: t("reports.status"),
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={params.row.status}
              color={getReportStatusColor(params.row.status) as any}
              size="small"
              sx={{
                fontWeight: 600,
                textTransform: "capitalize",
                "& .MuiChip-label": {
                  fontSize: "0.75rem",
                },
              }}
            />
            {user &&
              profile?.user_type === "owner" &&
              params.row.status === "submitted" &&
              onApproveReport && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => onApproveReport(params.row.id)}
                  sx={{
                    fontWeight: 500,
                    textTransform: "none",
                    px: 2,
                    py: 0.5,
                  }}
                >
                  {t("reports.approve")}
                </Button>
              )}
            {user &&
              profile?.user_type === "driver" &&
              params.row.status === "draft" &&
              onSubmitReport && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => onSubmitReport(params.row.id)}
                  disabled={!reportsWithIncomeSources.has(params.row.id)}
                  title={
                    !reportsWithIncomeSources.has(params.row.id)
                      ? "Add income sources before submitting"
                      : ""
                  }
                  sx={{
                    fontWeight: 500,
                    textTransform: "none",
                    px: 2,
                    py: 0.5,
                  }}
                >
                  {t("reports.submit")}
                </Button>
              )}
          </Box>
          {/* Draft Reminder for Drivers */}
          {params.row.status === "draft" && profile?.user_type === "driver" && (
            <Box
              sx={{
                p: 1,
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                borderRadius: 1,
                borderLeft: "3px solid #ffc107",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "warning.dark",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                {t("reports.submitReminder")}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      {isMobile ? (
        // Mobile Card Layout
        <Box sx={{ px: 1 }}>
          {weeklyReports.map((report) => (
            <MobileReportCard key={report.id} report={report} />
          ))}
        </Box>
      ) : (
        // Desktop Table Layout
        <Box
          sx={{
            height: 600,
            width: "100%",
            "& .MuiDataGrid-root": {
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              "& .MuiDataGrid-columnHeader": {
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "text.primary",
              },
            },
            "& .MuiDataGrid-row": {
              minHeight: "80px !important",
              "&:nth-of-type(even)": {
                backgroundColor: "#ffffff",
              },
              "&:nth-of-type(odd)": {
                backgroundColor: "#f8fafc",
              },
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.04) !important",
              },
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #e2e8f0",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <DataGrid
            rows={weeklyReports}
            columns={columns}
            getRowId={(row) => row.id}
            getRowHeight={() => 80}
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooterSelectedRowCount
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </Box>
      )}

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
