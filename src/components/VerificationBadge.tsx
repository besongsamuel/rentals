import { Cancel, CheckCircle } from "@mui/icons-material";
import { Chip, Tooltip } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface VerificationBadgeProps {
  isVerified: boolean;
  type: "driver" | "car";
  size?: "small" | "medium";
  showIcon?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  type,
  size = "small",
  showIcon = true,
}) => {
  const { t } = useTranslation();

  const getTooltipText = () => {
    if (isVerified) {
      return type === "driver"
        ? t("verification.driverVerifiedTooltip")
        : t("verification.carVerifiedTooltip");
    } else {
      return type === "driver"
        ? t("verification.driverNotVerifiedTooltip")
        : t("verification.carNotVerifiedTooltip");
    }
  };

  const getLabel = () => {
    if (isVerified) {
      return type === "driver"
        ? t("verification.driverVerified")
        : t("verification.carVerified");
    } else {
      return type === "driver"
        ? t("verification.driverNotVerified")
        : t("verification.carNotVerified");
    }
  };

  return (
    <Tooltip title={getTooltipText()} arrow>
      <Chip
        icon={
          showIcon ? (
            isVerified ? (
              <CheckCircle sx={{ fontSize: 18 }} />
            ) : (
              <Cancel sx={{ fontSize: 18 }} />
            )
          ) : undefined
        }
        label={getLabel()}
        size={size}
        sx={{
          backgroundColor: isVerified
            ? "rgba(46, 125, 50, 0.1)" // Green background for verified
            : "rgba(211, 47, 47, 0.1)", // Red background for not verified
          color: isVerified ? "#2e7d32" : "#d32f2f", // Green text for verified, red for not verified
          fontWeight: 600,
          fontSize: size === "small" ? "0.75rem" : "0.875rem",
          "& .MuiChip-icon": {
            color: isVerified ? "#2e7d32" : "#d32f2f",
          },
        }}
      />
    </Tooltip>
  );
};

export default VerificationBadge;
