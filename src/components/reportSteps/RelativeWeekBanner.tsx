import { Box, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getWeekOffsetFromToday } from "../../utils/dateHelpers";

interface RelativeWeekBannerProps {
  weekStartDate: string;
}

const RelativeWeekBanner: React.FC<RelativeWeekBannerProps> = ({
  weekStartDate,
}) => {
  const { t } = useTranslation();

  const relativeLabel = useMemo(() => {
    const offset = getWeekOffsetFromToday(weekStartDate);
    if (offset === null) {
      return null;
    }
    if (offset === 0) {
      return t("reports.relativeWeekThis");
    }
    if (offset === 1) {
      return t("reports.relativeWeekNext");
    }
    if (offset === -1) {
      return t("reports.relativeWeekLast");
    }
    if (offset > 1) {
      return t("reports.relativeWeekInFuture", { count: offset });
    }
    return t("reports.relativeWeekAgo", { count: Math.abs(offset) });
  }, [weekStartDate, t]);

  if (!relativeLabel) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 2,
        pt: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography
        variant="overline"
        sx={{
          display: "block",
          color: "text.secondary",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {t("reports.relativeWeekCaption")}
      </Typography>
      <Typography
        component="p"
        variant="h5"
        sx={{
          mt: 0.75,
          mb: 0,
          fontWeight: 700,
          color: "primary.main",
          lineHeight: 1.25,
        }}
      >
        {relativeLabel}
      </Typography>
    </Box>
  );
};

export default RelativeWeekBanner;
