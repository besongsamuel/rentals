import { Download, FileDownload, PictureAsPdf } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartData } from "../types";

interface ReportExporterProps {
  analyticsData: any;
  performanceMetrics: any;
  chartData: ChartData[];
  userType: "driver" | "owner";
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
    period: string;
  };
}

const ReportExporter: React.FC<ReportExporterProps> = ({
  analyticsData,
  performanceMetrics,
  chartData,
  userType,
  dateRange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [exporting, setExporting] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportClick = (format: "csv" | "pdf") => {
    setExportFormat(format);
    setExportDialogOpen(true);
    handleMenuClose();
  };

  const handleExportConfirm = async () => {
    setExporting(true);
    try {
      if (exportFormat === "csv") {
        await exportToCSV();
      } else {
        await exportToPDF();
      }
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    const csvData = generateCSVData();
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `analytics-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    // For now, we'll create a simple text-based PDF using a library
    // In a real implementation, you might use jsPDF or similar
    const pdfContent = generatePDFContent();
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `analytics-report-${new Date().toISOString().split("T")[0]}.txt`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVData = () => {
    const headers = ["Metric", "Value", "Period"];

    const rows = [
      ["Total Earnings", analyticsData?.totalEarnings || 0, dateRange.period],
      ["Total Revenue", analyticsData?.totalRevenue || 0, dateRange.period],
      ["Total Mileage", analyticsData?.totalMileage || 0, dateRange.period],
      ["Total Reports", analyticsData?.totalReports || 0, dateRange.period],
      [
        "Average Weekly Earnings",
        performanceMetrics?.averageWeeklyEarnings || 0,
        dateRange.period,
      ],
      [
        "Average Weekly Mileage",
        performanceMetrics?.averageWeeklyMileage || 0,
        dateRange.period,
      ],
      [
        "Earnings per Mile",
        performanceMetrics?.earningsPerMile || 0,
        dateRange.period,
      ],
      [
        "Report Submission Rate",
        performanceMetrics?.reportSubmissionRate || 0,
        dateRange.period,
      ],
    ];

    if (userType === "owner") {
      rows.push(
        [
          "Car Utilization",
          performanceMetrics?.carUtilization || 0,
          dateRange.period,
        ],
        [
          "Active Drivers",
          performanceMetrics?.activeDrivers || 0,
          dateRange.period,
        ]
      );
    }

    // Add chart data
    rows.push(["", "", ""]);
    rows.push(["Weekly Data", "", ""]);
    rows.push(["Week", "Earnings", "Mileage", "Expenses", "Net Earnings"]);

    chartData.forEach((data) => {
      rows.push([
        data.week,
        data.earnings.toString(),
        data.mileage.toString(),
        data.expenses.toString(),
        data.netEarnings.toString(),
      ]);
    });

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const generatePDFContent = () => {
    const content = `
ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}
Period: ${dateRange.period}
User Type: ${userType}

SUMMARY METRICS
===============
Total Earnings: ${analyticsData?.totalEarnings || 0} XAF
Total Revenue: ${analyticsData?.totalRevenue || 0} XAF
Total Mileage: ${analyticsData?.totalMileage || 0} km
Total Reports: ${analyticsData?.totalReports || 0}

PERFORMANCE METRICS
==================
Average Weekly Earnings: ${performanceMetrics?.averageWeeklyEarnings || 0} XAF
Average Weekly Mileage: ${performanceMetrics?.averageWeeklyMileage || 0} km
Earnings per Mile: ${performanceMetrics?.earningsPerMile || 0} XAF/km
Report Submission Rate: ${performanceMetrics?.reportSubmissionRate || 0}%

${
  userType === "owner"
    ? `
OWNER SPECIFIC METRICS
=====================
Car Utilization: ${performanceMetrics?.carUtilization || 0}%
Active Drivers: ${performanceMetrics?.activeDrivers || 0}
`
    : ""
}

WEEKLY DATA
===========
${chartData
  .map(
    (data) =>
      `Week ${data.week}: Earnings ${data.earnings} XAF, Mileage ${data.mileage} km, Expenses ${data.expenses} XAF, Net ${data.netEarnings} XAF`
  )
  .join("\n")}
    `;
    return content;
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={handleMenuOpen}
        sx={{
          minWidth: { xs: "100%", sm: "auto" },
        }}
      >
        Export Report
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleExportClick("csv")}>
          <FileDownload sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExportClick("pdf")}>
          <PictureAsPdf sx={{ mr: 1 }} />
          Export as PDF
        </MenuItem>
      </Menu>

      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Analytics Report</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Export your analytics data for the selected period.
          </Typography>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Export Details:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Period: {dateRange.period}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • User Type: {userType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Data Points: {chartData.length} weeks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Format: {exportFormat.toUpperCase()}
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setExportDialogOpen(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportConfirm}
            variant="contained"
            disabled={exporting}
            startIcon={exporting ? <Download /> : <Download />}
          >
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportExporter;
