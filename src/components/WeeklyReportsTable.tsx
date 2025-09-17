import { AttachMoney, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Profile, WeeklyReport } from "../types";
import EarningsDetailsDialog from "./EarningsDetailsDialog";

interface WeeklyReportsTableProps {
  weeklyReports: (WeeklyReport & { total_earnings: number })[];
  reportsWithIncomeSources: Set<string>;
  profile?: Profile | null;
  user?: any;
  onViewDetails?: (report: WeeklyReport) => void;
  onEditReport?: (report: WeeklyReport) => void;
  onApproveReport?: (reportId: string) => void;
  onSubmitReport?: (reportId: string) => void;
  getReportStatusColor: (status: string) => string;
}

const WeeklyReportsTable: React.FC<WeeklyReportsTableProps> = ({
  weeklyReports,
  reportsWithIncomeSources,
  profile,
  user,
  onViewDetails,
  onEditReport,
  onApproveReport,
  onSubmitReport,
  getReportStatusColor,
}) => {
  const { t } = useTranslation();
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null
  );

  const handleViewEarnings = (report: WeeklyReport) => {
    if (onViewDetails) {
      onViewDetails(report);
    } else {
      setSelectedReport(report);
      setEarningsDialogOpen(true);
    }
  };

  const handleCloseEarningsDialog = () => {
    setEarningsDialogOpen(false);
    setSelectedReport(null);
  };

  if (weeklyReports.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {t("reports.noReportsFound")}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: "#f8fafc",
                "& .MuiTableCell-head": {
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  borderBottom: "1px solid #e2e8f0",
                },
              }}
            >
              <TableCell>Actions</TableCell>
              <TableCell>{t("reports.weekPeriod")}</TableCell>
              <TableCell align="right">{t("reports.startMileage")}</TableCell>
              <TableCell align="right">{t("reports.endMileage")}</TableCell>
              <TableCell align="right">{t("reports.driverEarnings")}</TableCell>
              <TableCell align="right">{t("reports.totalEarnings")}</TableCell>
              <TableCell align="right">{t("reports.maintenance")}</TableCell>
              <TableCell>{t("reports.status")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weeklyReports.map((report, index) => (
              <TableRow
                key={report.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.04)",
                  },
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid #e2e8f0",
                    padding: "12px 16px",
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {onEditReport && report.status === "draft" && (
                      <Tooltip title="Edit report">
                        <IconButton
                          size="small"
                          onClick={() => onEditReport(report)}
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
                        onClick={() => handleViewEarnings(report)}
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
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "text.primary" }}
                  >
                    {new Date(report.week_start_date).toLocaleDateString()} -{" "}
                    {new Date(report.week_end_date).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "info.main" }}
                  >
                    {report.start_mileage.toLocaleString()} KM
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "info.main" }}
                  >
                    {report.end_mileage.toLocaleString()} KM
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "success.main" }}
                  >
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XAF",
                    }).format(report.driver_earnings)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XAF",
                    }).format(report.total_earnings)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "error.main" }}
                  >
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XAF",
                    }).format(report.maintenance_expenses)}
                  </Typography>
                </TableCell>
                <TableCell>
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
                            px: 2,
                            py: 0.5,
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
                            px: 2,
                            py: 0.5,
                          }}
                        >
                          {t("reports.submit")}
                        </Button>
                      )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Earnings Details Dialog */}
      <EarningsDetailsDialog
        open={earningsDialogOpen}
        onClose={handleCloseEarningsDialog}
        weeklyReport={selectedReport}
      />
    </>
  );
};

export default WeeklyReportsTable;
