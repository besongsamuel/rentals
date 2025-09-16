import { AttachMoney, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
  drivers: Profile[];
  reportsWithIncomeSources: Set<string>;
  profile?: Profile | null;
  user?: any;
  onViewDetails?: (report: WeeklyReport) => void;
  onEditReport?: (report: WeeklyReport) => void;
  onApproveReport?: (reportId: string) => void;
  onSubmitReport?: (reportId: string) => void;
  getReportStatusColor: (status: string) => string;
  selectedDriverId?: string;
  onDriverFilterChange?: (driverId: string) => void;
}

const WeeklyReportsTable: React.FC<WeeklyReportsTableProps> = ({
  weeklyReports,
  drivers,
  reportsWithIncomeSources,
  profile,
  user,
  onViewDetails,
  onEditReport,
  onApproveReport,
  onSubmitReport,
  getReportStatusColor,
  selectedDriverId = "",
  onDriverFilterChange,
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

  // Filter reports by selected driver
  const filteredReports = selectedDriverId
    ? weeklyReports.filter((report) => report.driver_id === selectedDriverId)
    : weeklyReports;

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
      {/* Driver Filter */}
      {drivers.length > 1 && onDriverFilterChange && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("reports.filterByDriver")}</InputLabel>
            <Select
              value={selectedDriverId}
              onChange={(e) => onDriverFilterChange(e.target.value)}
              label={t("reports.filterByDriver")}
            >
              <MenuItem value="">
                <em>{t("reports.allDrivers")}</em>
              </MenuItem>
              {drivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.full_name || driver.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {filteredReports.length} {t("reports.reportsFound")}
          </Typography>
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
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
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {onEditReport && report.status === "draft" && (
                      <Tooltip title="Edit report">
                        <IconButton
                          size="small"
                          onClick={() => onEditReport(report)}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            "&:hover": {
                              bgcolor: "action.hover",
                              borderColor: "primary.main",
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
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            bgcolor: "action.hover",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <AttachMoney />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(report.week_start_date).toLocaleDateString()} -{" "}
                  {new Date(report.week_end_date).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  {report.start_mileage.toLocaleString()} KM
                </TableCell>
                <TableCell align="right">
                  {report.end_mileage.toLocaleString()} KM
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XAF",
                  }).format(report.driver_earnings)}
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XAF",
                  }).format(report.total_earnings)}
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XAF",
                  }).format(report.maintenance_expenses)}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={report.status}
                      color={getReportStatusColor(report.status) as any}
                      size="small"
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
