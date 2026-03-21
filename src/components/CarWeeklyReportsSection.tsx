import { Add, EventBusy } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Profile, WeeklyReport } from "../types";
import WeeklyReportsTable from "./WeeklyReportsTable";

export interface CarWeeklyReportsSectionProps {
  weeklyReports: (WeeklyReport & { total_earnings: number })[];
  reportsWithIncomeSources: Set<string>;
  profile: Profile | null;
  user: unknown;
  selectedYear: number | "";
  selectedMonth: number | "";
  onYearChange: (year: number | "") => void;
  onMonthChange: (month: number | "") => void;
  onClearFilters: () => void;
  /** When set, toggles both add-report and missing-weeks shortcuts (owner/car page). */
  showWeeklyReportShortcuts: boolean;
  /** Override: show “Add report” without requiring missing-weeks (e.g. driver with no car yet). */
  showAddReportButton?: boolean;
  /** Override: show “Missing weeks” independently. */
  showMissingWeeksButton?: boolean;
  onAddNewReport: () => void;
  onOpenMissingWeeks: () => void;
  onViewEarnings?: (report: WeeklyReport) => void;
  onEditReport: (report: WeeklyReport) => void;
  onApproveReport?: (reportId: string) => void;
  onSubmitReport: (reportId: string) => void;
  /** When true, omit outer Grid items (for use inside tab panel) */
  embedded?: boolean;
  /** Hide year/month filters (e.g. driver dashboard — all reports) */
  hideFilters?: boolean;
  /** When there are no reports, render this instead of tips + empty table */
  weeklyEmptyContent?: React.ReactNode;
}

const CarWeeklyReportsSection: React.FC<CarWeeklyReportsSectionProps> = ({
  weeklyReports,
  reportsWithIncomeSources,
  profile,
  user,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onClearFilters,
  showWeeklyReportShortcuts,
  showAddReportButton,
  showMissingWeeksButton,
  onAddNewReport,
  onOpenMissingWeeks,
  onViewEarnings,
  onEditReport,
  onApproveReport,
  onSubmitReport,
  embedded = false,
  hideFilters = false,
  weeklyEmptyContent,
}) => {
  const { t } = useTranslation();

  const showTipsAndTable = !(
    weeklyReports.length === 0 && weeklyEmptyContent != null
  );

  const addReportVisible =
    showAddReportButton ?? showWeeklyReportShortcuts;
  const missingWeeksVisible =
    showMissingWeeksButton ?? showWeeklyReportShortcuts;

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  const generateMonthOptions = () => [
    { value: 1, label: t("months.january") },
    { value: 2, label: t("months.february") },
    { value: 3, label: t("months.march") },
    { value: 4, label: t("months.april") },
    { value: 5, label: t("months.may") },
    { value: 6, label: t("months.june") },
    { value: 7, label: t("months.july") },
    { value: 8, label: t("months.august") },
    { value: 9, label: t("months.september") },
    { value: 10, label: t("months.october") },
    { value: 11, label: t("months.november") },
    { value: 12, label: t("months.december") },
  ];

  const filtersCard = (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("reports.filterReports")}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={6}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value as number | "")}
                displayEmpty
              >
                <MenuItem value="">
                  <em>{t("reports.allYears")}</em>
                </MenuItem>
                {generateYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={6}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value as number | "")}
                displayEmpty
                disabled={!selectedYear}
              >
                <MenuItem value="">
                  <em>{t("reports.allMonths")}</em>
                </MenuItem>
                {generateMonthOptions().map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={12}>
            <Button
              variant="outlined"
              size="small"
              onClick={onClearFilters}
              disabled={!selectedYear && !selectedMonth}
            >
              {t("reports.clearFilters")}
            </Button>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary">
          {t("reports.found", { count: weeklyReports.length })}
          {selectedYear && selectedMonth && (
            <>
              {" "}
              for {generateMonthOptions()[selectedMonth - 1]?.label}{" "}
              {selectedYear}
            </>
          )}
          {selectedYear && !selectedMonth && <> for {selectedYear}</>}
          {!selectedYear && <> (all time)</>}
        </Typography>
      </CardContent>
    </Card>
  );

  const weeklyTableCard = (
    <Card elevation={2}>
      <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
                mb: 2,
              }}
            >
              <Typography variant="h6">
                {t("carManagement.weeklyReportsDetails")}
              </Typography>
              {(addReportVisible || missingWeeksVisible) && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  {addReportVisible && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={onAddNewReport}
                      size="small"
                      sx={{ minHeight: 44 }}
                    >
                      {t("carManagement.addNewReport")}
                    </Button>
                  )}
                  {missingWeeksVisible && (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EventBusy />}
                      onClick={onOpenMissingWeeks}
                      size="small"
                      sx={{ minHeight: 44 }}
                    >
                      {t("reports.missingWeeksShort")}
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            {showTipsAndTable && (
              <Card
                sx={{
                  mb: 3,
                  background:
                    "linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(0, 122, 255, 0.02) 100%)",
                  border: "1px solid rgba(0, 122, 255, 0.2)",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: "#1d1d1f",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    💡 {t("carManagement.reportTipsTitle")}
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1d1d1f",
                        mb: 1.5,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "#007AFF",
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      {t("carManagement.reportTip1")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1d1d1f",
                        mb: 1.5,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "#007AFF",
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      {t("carManagement.reportTip2")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1d1d1f",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "#007AFF",
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      {t("carManagement.reportTip3")}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {weeklyReports.length === 0 && weeklyEmptyContent != null ? (
              weeklyEmptyContent
            ) : (
              <WeeklyReportsTable
                weeklyReports={weeklyReports}
                reportsWithIncomeSources={reportsWithIncomeSources}
                profile={profile}
                user={user}
                onViewDetails={onViewEarnings}
                onEditReport={onEditReport}
                onApproveReport={onApproveReport}
                onSubmitReport={onSubmitReport}
              />
            )}
      </CardContent>
    </Card>
  );

  if (embedded) {
    return (
      <Stack spacing={2}>
        {!hideFilters && filtersCard}
        {weeklyTableCard}
      </Stack>
    );
  }

  return (
    <>
      {!hideFilters && <Grid size={12}>{filtersCard}</Grid>}
      <Grid size={12}>{weeklyTableCard}</Grid>
    </>
  );
};

export default CarWeeklyReportsSection;
