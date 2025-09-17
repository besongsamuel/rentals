import { AttachMoney, Comment, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
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
          {onEditReport && params.row.status === "draft" && (
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
      field: "startMileage",
      headerName: t("reports.startMileage"),
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="info.main" fontWeight={500}>
          {params.row.start_mileage.toLocaleString()} {t("common.km")}
        </Typography>
      ),
    },
    {
      field: "endMileage",
      headerName: t("reports.endMileage"),
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="info.main" fontWeight={500}>
          {params.row.end_mileage.toLocaleString()} {t("common.km")}
        </Typography>
      ),
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
      field: "totalEarnings",
      headerName: t("reports.totalEarnings"),
      width: 140,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => {
        const totalEarnings =
          (params.row as any).ride_share_income +
          (params.row as any).rental_income;
        return (
          <Typography variant="body2" color="success.main" fontWeight={500}>
            {totalEarnings.toLocaleString()} {t("common.currency")}
          </Typography>
        );
      },
    },
    {
      field: "maintenance",
      headerName: t("reports.maintenance"),
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="error.main" fontWeight={500}>
          {params.row.maintenance_expenses.toLocaleString()}{" "}
          {t("common.currency")}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: t("reports.status"),
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
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
      ),
    },
  ];

  return (
    <>
      <Box
        sx={{
          height: 600,
          width: "100%",
          "& .MuiDataGrid-root": {
            border: "1px solid #e2e8f0",
            borderRadius: 2,
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
          },
        }}
      >
        <DataGrid
          rows={weeklyReports}
          columns={columns}
          getRowId={(row) => row.id}
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
