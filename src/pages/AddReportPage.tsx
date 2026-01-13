import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CarSelectionStep from "../components/reportSteps/CarSelectionStep";
import DateSelectionStep from "../components/reportSteps/DateSelectionStep";
import DriverEarningsStep from "../components/reportSteps/DriverEarningsStep";
import GasExpenseStep from "../components/reportSteps/GasExpenseStep";
import MaintenanceStep from "../components/reportSteps/MaintenanceStep";
import MileageStep from "../components/reportSteps/MileageStep";
import ReportSummaryStep from "../components/reportSteps/ReportSummaryStep";
import RevenueStep from "../components/reportSteps/RevenueStep";
import StepNavigation from "../components/reportSteps/StepNavigation";
import ErrorAlert from "../components/ErrorAlert";
import SkeletonLoader from "../components/SkeletonLoader";
import { useUserContext } from "../contexts/UserContext";
import { carService } from "../services/carService";
import { weeklyReportService } from "../services/weeklyReportService";
import { Car, CreateWeeklyReportData, WeeklyReport } from "../types";
import { calculateMileageForNewReport, getCurrentWeek } from "../utils/dateHelpers";

const AddReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useUserContext();

  const isEditMode = !!reportId;
  const preSelectedCarId = searchParams.get("car_id") || "";

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [existingReports, setExistingReports] = useState<WeeklyReport[]>([]);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    car_id: preSelectedCarId,
    week_start_date: "",
    week_end_date: "",
    start_mileage: 0,
    end_mileage: 0,
    driver_earnings: 0,
    maintenance_expenses: 0,
    has_maintenance: false,
    gas_expense: 0,
    ride_share_income: 0,
    rental_income: 0,
    taxi_income: 0,
    currency: "XAF",
    driver_id: "",
  });

  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const needsCarSelection = cars.length > 1;
  const totalSteps = needsCarSelection ? 8 : 7; // 8 if car selection needed, 7 otherwise

  // Step labels
  const stepLabels = needsCarSelection
    ? [
        t("reports.stepCarSelection"),
        t("reports.stepDateSelection"),
        t("reports.stepMileage"),
        t("reports.stepMaintenance"),
        t("reports.stepGasExpense"),
        t("reports.stepRevenue"),
        t("reports.stepDriverEarnings"),
        t("reports.stepSummary"),
      ]
    : [
        t("reports.stepDateSelection"),
        t("reports.stepMileage"),
        t("reports.stepMaintenance"),
        t("reports.stepGasExpense"),
        t("reports.stepRevenue"),
        t("reports.stepDriverEarnings"),
        t("reports.stepSummary"),
      ];

  // Load data
  const loadData = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    setError("");

    try {
      // Load cars based on user type
      let carsData: Car[] = [];
      if (profile.user_type === "driver") {
        carsData = await carService.getCarsByDriver(profile.id);
      } else {
        carsData = await carService.getCarsByOwner(profile.id);
      }
      setCars(carsData);

      // Load existing reports for mileage calculation
      if (profile.user_type === "driver") {
        const reports = await weeklyReportService.getReportsByDriver(profile.id);
        setExistingReports(reports);
      }

      // Load report if editing
      if (isEditMode && reportId) {
        const report = await weeklyReportService.getReportById(reportId);
        if (!report) {
          setError(t("reports.reportNotFound"));
          return;
        }
        setEditingReport(report);

        // Pre-fill form data
        setFormData({
          car_id: report.car_id,
          week_start_date: report.week_start_date,
          week_end_date: report.week_end_date,
          start_mileage: report.start_mileage,
          end_mileage: report.end_mileage,
          driver_earnings: report.driver_earnings,
          maintenance_expenses: report.maintenance_expenses,
          has_maintenance: (report.maintenance_expenses || 0) > 0,
          gas_expense: report.gas_expense || 0,
          ride_share_income: report.ride_share_income || 0,
          rental_income: report.rental_income || 0,
          taxi_income: report.taxi_income || 0,
          currency: report.currency || "XAF",
          driver_id: report.driver_id,
        });
      } else {
        // Initialize with current week for new report
        const currentWeek = getCurrentWeek();
        const selectedCarId = preSelectedCarId || (carsData.length === 1 ? carsData[0].id : "");
        
        if (selectedCarId && carsData.length > 0) {
          // Load reports for mileage calculation if driver
          let reports: WeeklyReport[] = [];
          if (profile.user_type === "driver") {
            reports = await weeklyReportService.getReportsByDriver(profile.id);
            setExistingReports(reports);
          }
          
          const mileage = calculateMileageForNewReport(
            selectedCarId,
            carsData,
            reports
          );
          
          setFormData((prev) => ({
            ...prev,
            car_id: selectedCarId,
            week_start_date: currentWeek.start,
            week_end_date: currentWeek.end,
            start_mileage: mileage.startMileage,
            end_mileage: mileage.endMileage,
            driver_id: profile.id,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            week_start_date: currentWeek.start,
            week_end_date: currentWeek.end,
            driver_id: profile.id,
          }));
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [profile, isEditMode, reportId, preSelectedCarId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate mileage when car changes
  useEffect(() => {
    if (!isEditMode && formData.car_id && cars.length > 0 && existingReports.length >= 0) {
      const mileage = calculateMileageForNewReport(
        formData.car_id,
        cars,
        existingReports
      );
      setFormData((prev) => ({
        ...prev,
        start_mileage: mileage.startMileage,
        end_mileage: mileage.endMileage,
      }));
    }
  }, [formData.car_id, cars, isEditMode, existingReports]);

  // Validation
  const validateStep = (step: number): boolean => {
    const actualStep = needsCarSelection ? step : step + 1;

    switch (actualStep) {
      case 0: // Car selection
        return !!formData.car_id;
      case 1: // Date selection
        return !!(formData.week_start_date && formData.week_end_date);
      case 2: // Mileage
        return (
          formData.start_mileage >= 0 &&
          formData.end_mileage >= 0 &&
          formData.end_mileage >= formData.start_mileage
        );
      case 3: // Maintenance
        return !formData.has_maintenance || formData.maintenance_expenses >= 0;
      case 4: // Gas expense
        return formData.gas_expense >= 0;
      case 5: // Revenue (always valid, can be 0)
        return true;
      case 6: // Driver earnings
        return formData.driver_earnings >= 0;
      case 7: // Summary (always valid)
        return true;
      default:
        return true;
    }
  };

  const canGoNext = validateStep(currentStep);

  // Navigation handlers
  const handleNext = () => {
    if (!canGoNext) return;

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setError("");
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    navigate(-1);
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Submit
  const handleSubmit = async () => {
    if (!profile?.id) return;

    setError("");

    try {
      const reportData: CreateWeeklyReportData = {
        car_id: formData.car_id,
        week_start_date: formData.week_start_date,
        week_end_date: formData.week_end_date,
        start_mileage: formData.start_mileage,
        end_mileage: formData.end_mileage,
        driver_earnings: formData.driver_earnings,
        maintenance_expenses: formData.has_maintenance ? formData.maintenance_expenses : 0,
        gas_expense: formData.gas_expense,
        ride_share_income: formData.ride_share_income,
        rental_income: formData.rental_income,
        taxi_income: formData.taxi_income,
        currency: formData.currency,
      };

      if (isEditMode && editingReport) {
        await weeklyReportService.updateReport(editingReport.id, reportData);
      } else {
        await weeklyReportService.createReport({
          ...reportData,
          driver_id: formData.driver_id || profile.id,
        });
      }

      // Navigate back
      navigate(-1);
    } catch (err) {
      console.error("Error saving report:", err);
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  };

  if (loading) {
    return <SkeletonLoader variant="dashboard" />;
  }

  const selectedCar = cars.find((c) => c.id === formData.car_id);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        pb: 10, // Space for sticky navigation
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 500, flex: 1 }}>
              {isEditMode ? t("reports.editReport") : t("reports.addReport")}
            </Typography>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Box sx={{ mb: 2 }}>
            <ErrorAlert message={error} />
          </Box>
        )}

        {/* Step Content */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            mb: 2,
            borderRadius: 2,
            backgroundColor: "background.paper",
            minHeight: 400,
          }}
        >
          {needsCarSelection && currentStep === 0 && (
            <CarSelectionStep
              cars={cars}
              selectedCarId={formData.car_id}
              onCarChange={(carId) =>
                setFormData((prev) => ({ ...prev, car_id: carId }))
              }
              userType={profile?.user_type}
            />
          )}

          {(needsCarSelection ? currentStep === 1 : currentStep === 0) && (
            <DateSelectionStep
              weekStartDate={formData.week_start_date}
              weekEndDate={formData.week_end_date}
              onDateChange={(start, end) =>
                setFormData((prev) => ({
                  ...prev,
                  week_start_date: start,
                  week_end_date: end,
                }))
              }
            />
          )}

          {(needsCarSelection ? currentStep === 2 : currentStep === 1) && (
            <MileageStep
              startMileage={formData.start_mileage}
              endMileage={formData.end_mileage}
              onMileageChange={(start, end) =>
                setFormData((prev) => ({
                  ...prev,
                  start_mileage: start,
                  end_mileage: end,
                }))
              }
            />
          )}

          {(needsCarSelection ? currentStep === 3 : currentStep === 2) && (
            <MaintenanceStep
              hasMaintenance={formData.has_maintenance}
              maintenanceAmount={formData.maintenance_expenses}
              currency={formData.currency}
              onMaintenanceChange={(has, amount) =>
                setFormData((prev) => ({
                  ...prev,
                  has_maintenance: has,
                  maintenance_expenses: amount,
                }))
              }
            />
          )}

          {(needsCarSelection ? currentStep === 4 : currentStep === 3) && (
            <GasExpenseStep
              gasExpense={formData.gas_expense}
              currency={formData.currency}
              onGasExpenseChange={(amount) =>
                setFormData((prev) => ({ ...prev, gas_expense: amount }))
              }
            />
          )}

          {(needsCarSelection ? currentStep === 5 : currentStep === 4) && (
            <RevenueStep
              rideShareIncome={formData.ride_share_income}
              rentalIncome={formData.rental_income}
              taxiIncome={formData.taxi_income}
              currency={formData.currency}
              onRevenueChange={(type, amount) => {
                const fieldMap: Record<"rideshare" | "rental" | "taxi", keyof typeof formData> = {
                  rideshare: "ride_share_income",
                  rental: "rental_income",
                  taxi: "taxi_income",
                };
                setFormData((prev) => ({
                  ...prev,
                  [fieldMap[type]]: amount,
                }));
              }}
            />
          )}

          {(needsCarSelection ? currentStep === 6 : currentStep === 5) && (
            <DriverEarningsStep
              driverEarnings={formData.driver_earnings}
              currency={formData.currency}
              onDriverEarningsChange={(amount) =>
                setFormData((prev) => ({ ...prev, driver_earnings: amount }))
              }
            />
          )}

          {(needsCarSelection ? currentStep === 7 : currentStep === 6) && (
            <ReportSummaryStep
              car={selectedCar || null}
              weekStartDate={formData.week_start_date}
              weekEndDate={formData.week_end_date}
              startMileage={formData.start_mileage}
              endMileage={formData.end_mileage}
              maintenanceExpenses={formData.maintenance_expenses}
              gasExpense={formData.gas_expense}
              rideShareIncome={formData.ride_share_income}
              rentalIncome={formData.rental_income}
              taxiIncome={formData.taxi_income}
              driverEarnings={formData.driver_earnings}
              currency={formData.currency}
              onEditStep={handleEditStep}
            />
          )}
        </Paper>

        {/* Navigation */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={handleNext}
          onCancel={handleCancel}
          canGoNext={canGoNext}
          isLastStep={currentStep === totalSteps - 1}
          stepLabels={stepLabels}
        />
      </Container>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>{t("reports.cancelReport")}</DialogTitle>
        <DialogContent>
          <Typography>{t("reports.cancelReportConfirmation")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            {t("reports.confirmCancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddReportPage;
