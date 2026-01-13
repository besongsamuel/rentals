import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, Button, LinearProgress, Stepper, Step, StepLabel, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  canGoNext: boolean;
  isLastStep: boolean;
  stepLabels: string[];
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onCancel,
  canGoNext,
  isLastStep,
  stepLabels,
}) => {
  const { t } = useTranslation();

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        zIndex: 1000,
        pt: 2,
        pb: { xs: 2, sm: 2 },
        px: { xs: 2, sm: 3 },
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "rgba(0,0,0,0.1)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            textAlign: "center",
            display: "block",
            color: "text.secondary",
          }}
        >
          {t("reports.stepProgress", {
            current: currentStep + 1,
            total: totalSteps,
          })}
        </Typography>
      </Box>

      {/* Step Indicator - Hidden on mobile, shown on larger screens */}
      <Box sx={{ display: { xs: "none", sm: "block" }, mb: 2 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {stepLabels.map((label, index) => (
            <Step key={index} completed={index < currentStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          fullWidth={false}
          sx={{
            order: { xs: 3, sm: 1 },
            minWidth: { xs: "100%", sm: "auto" },
            flex: { xs: "1", sm: "none" },
          }}
        >
          {t("common.cancel")}
        </Button>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flex: { xs: "1", sm: "none" },
            order: { xs: 1, sm: 2 },
          }}
        >
          {currentStep > 0 && (
            <Button
              onClick={onBack}
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{
                flex: { xs: 1, sm: "none" },
                minWidth: { xs: "auto", sm: 120 },
              }}
            >
              {t("common.back")}
            </Button>
          )}
          <Button
            onClick={onNext}
            variant="contained"
            disabled={!canGoNext}
            endIcon={!isLastStep ? <ArrowForward /> : undefined}
            sx={{
              flex: { xs: 1, sm: "none" },
              minWidth: { xs: "auto", sm: 120 },
            }}
          >
            {isLastStep ? t("reports.submitReport") : t("common.next")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default StepNavigation;
