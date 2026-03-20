import { Close as CloseIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { weeklyReportService } from "../services/weeklyReportService";
import { Car, WeeklyReport } from "../types";
import {
  formatSqlDateOnlyForDisplay,
  getMissingWeekRangesForCar,
  type WeekRange,
} from "../utils/dateHelpers";

/** Shown in copy when the car has no reports yet (fallback window). */
const FALLBACK_WEEKS_WHEN_NO_REPORTS = 52;

export interface MissingWeeksDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * When set, loads all-time reports for this car (ignores parent filters).
   * When null, uses `driverReports` for every car in `cars`.
   */
  carId: string | null;
  cars: Car[];
  driverReports?: WeeklyReport[];
}

const MissingWeeksDialog: React.FC<MissingWeeksDialogProps> = ({
  open,
  onClose,
  carId,
  cars,
  driverReports = [],
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [fetchedReports, setFetchedReports] = useState<WeeklyReport[]>([]);

  useEffect(() => {
    if (!open || carId) {
      return;
    }
    setFetchedReports(driverReports);
    setLoading(false);
  }, [open, carId, driverReports]);

  useEffect(() => {
    if (!open || !carId) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    weeklyReportService
      .getReportsByCar(carId)
      .then((data) => {
        if (!cancelled) {
          setFetchedReports(data || []);
        }
      })
      .catch((e) => {
        console.error("MissingWeeksDialog: failed to load reports", e);
        if (!cancelled) {
          setFetchedReports([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, carId]);

  const sections = useMemo(() => {
    const list: { car: Car; missing: WeekRange[] }[] = [];
    if (carId) {
      const car = cars.find((c) => c.id === carId);
      if (car) {
        list.push({
          car,
          missing: getMissingWeekRangesForCar(carId, fetchedReports),
        });
      }
    } else {
      for (const car of cars) {
        const missing = getMissingWeekRangesForCar(car.id, fetchedReports);
        if (missing.length > 0) {
          list.push({ car, missing });
        }
      }
    }
    return list;
  }, [carId, cars, fetchedReports]);

  const totalMissing = sections.reduce((n, s) => n + s.missing.length, 0);

  const handleFillWeek = (cid: string, range: WeekRange) => {
    const params = new URLSearchParams({
      car_id: cid,
      week_start: range.weekStart,
      week_end: range.weekEnd,
    });
    navigate(`/reports/add?${params.toString()}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby="missing-weeks-dialog-title"
    >
      <DialogTitle
        id="missing-weeks-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
          {t("reports.missingWeeksTitle")}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label={t("common.close")}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("reports.missingWeeksDescription", {
            count: FALLBACK_WEEKS_WHEN_NO_REPORTS,
          })}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, py: 1 }}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Box>
        ) : totalMissing === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
            {t("reports.noMissingWeeks")}
          </Typography>
        ) : (
          sections.map(({ car, missing }) => (
            <Box key={car.id} sx={{ mb: 2 }}>
              {(carId ? false : cars.length > 1) && (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}
                  >
                    {car.year} {car.make} {car.model}
                    {car.license_plate ? ` · ${car.license_plate}` : ""}
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                </>
              )}
              <List disablePadding dense>
                {missing.map((range) => (
                  <ListItem
                    key={`${car.id}-${range.weekStart}`}
                    sx={{
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      gap: 1,
                      py: 1.5,
                      px: 0,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatSqlDateOnlyForDisplay(
                          range.weekStart,
                          i18n.language
                        )}{" "}
                        –{" "}
                        {formatSqlDateOnlyForDisplay(
                          range.weekEnd,
                          i18n.language
                        )}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="medium"
                      onClick={() => handleFillWeek(car.id, range)}
                      sx={{
                        minHeight: 44,
                        flexShrink: 0,
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      {t("reports.fillReportForWeek")}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MissingWeeksDialog;
