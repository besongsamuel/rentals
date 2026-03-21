import { Box, Grid, Paper, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CarOffReportExpensesSection from "./CarOffReportExpensesSection";
import CarWeeklyReportsSection, {
  type CarWeeklyReportsSectionProps,
} from "./CarWeeklyReportsSection";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`car-reports-tabpanel-${index}`}
      aria-labelledby={`car-reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2, px: { xs: 1, sm: 2 }, pb: 2 }}>{children}</Box>
      )}
    </div>
  );
}

export type CarReportsExpensesTabsProps = Omit<
  CarWeeklyReportsSectionProps,
  "embedded"
> &
  Pick<
    React.ComponentProps<typeof CarOffReportExpensesSection>,
    | "carId"
    | "cars"
    | "canAddExpense"
    | "onExpensesChanged"
    | "canApproveCarExpenses"
  >;

const CarReportsExpensesTabs: React.FC<CarReportsExpensesTabsProps> = ({
  carId,
  cars,
  canAddExpense,
  onExpensesChanged,
  canApproveCarExpenses,
  ...weeklyProps
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  const handleExpensesChanged = () => {
    setTab(1);
    onExpensesChanged?.();
  };

  return (
    <Grid size={12}>
      <Paper elevation={3} sx={{ overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            minHeight: 48,
            "& .MuiTab-root": { minHeight: 48, py: 1.5 },
          }}
          aria-label={t("carManagement.weeklyReportsDetails")}
        >
          <Tab
            id="car-reports-tab-0"
            aria-controls="car-reports-tabpanel-0"
            label={t("carManagement.tabWeeklyReports")}
          />
          <Tab
            id="car-reports-tab-1"
            aria-controls="car-reports-tabpanel-1"
            label={t("carManagement.tabCarExpenses")}
          />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <CarWeeklyReportsSection {...weeklyProps} embedded />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <CarOffReportExpensesSection
            carId={carId}
            cars={cars}
            canAddExpense={canAddExpense}
            canApproveCarExpenses={canApproveCarExpenses}
            profile={weeklyProps.profile}
            onExpensesChanged={handleExpensesChanged}
            embedded
          />
        </TabPanel>
      </Paper>
    </Grid>
  );
};

export default CarReportsExpensesTabs;
