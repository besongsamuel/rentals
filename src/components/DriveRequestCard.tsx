import {
  AccessTime,
  CalendarToday,
  Cancel,
  Check,
  Close,
  DirectionsCar,
  Edit,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { CarAssignmentRequest } from "../types";

interface DriveRequestCardProps {
  request: any; // CarAssignmentRequest with joined data
  userType: "driver" | "owner";
  onEdit?: (request: CarAssignmentRequest) => void;
  onWithdraw?: (request: CarAssignmentRequest) => void;
  onApprove?: (request: CarAssignmentRequest) => void;
  onReject?: (request: CarAssignmentRequest) => void;
  onViewDetails?: (request: CarAssignmentRequest) => void;
}

const DriveRequestCard: React.FC<DriveRequestCardProps> = ({
  request,
  userType,
  onEdit,
  onWithdraw,
  onApprove,
  onReject,
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return theme.palette.warning.main;
      case "approved":
        return theme.palette.success.main;
      case "rejected":
        return theme.palette.error.main;
      case "withdrawn":
        return theme.palette.grey[500];
      case "expired":
        return theme.palette.grey[400];
      default:
        return theme.palette.grey[500];
    }
  };

  const car = request.cars;
  const profile = userType === "driver" ? request.profiles : request.profiles;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DirectionsCar sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {car?.make} {car?.model}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {car?.year} • {car?.license_plate || t("common.notAvailable")}
            </Typography>
          </Box>

          <Chip
            label={t(`driveRequests.status.${request.status}`)}
            size="small"
            sx={{
              backgroundColor: `${getStatusColor(request.status)}15`,
              color: getStatusColor(request.status),
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Driver/Owner Info */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Person sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {userType === "driver"
                ? t("driveRequests.owner")
                : t("driveRequests.driver")}
              :
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
            {profile?.full_name || t("common.unknown")}
          </Typography>
        </Box>

        {/* Availability Dates */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={request.available_end_date ? 6 : 12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {t("driveRequests.startDate")}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
              {new Date(request.available_start_date).toLocaleDateString()}
            </Typography>
          </Grid>

          {request.available_end_date && (
            <Grid size={6}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {t("driveRequests.endDate")}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
                {new Date(request.available_end_date).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Max Hours */}
        {request.max_hours_per_week && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <AccessTime sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {t("driveRequests.maxHoursPerWeek")}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, ml: 3 }}>
              {request.max_hours_per_week} {t("driveRequests.hoursPerWeek")}
            </Typography>
          </Box>
        )}

        {/* Driver Notes */}
        {request.driver_notes && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              {t("driveRequests.driverNotes")}:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                bgcolor: "background.default",
                p: 1.5,
                borderRadius: 1,
                fontStyle: "italic",
              }}
            >
              {request.driver_notes}
            </Typography>
          </Box>
        )}

        {/* Rejection Reason (if rejected) */}
        {request.status === "rejected" && request.rejection_reason && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="error"
              sx={{ mb: 0.5, fontWeight: 500 }}
            >
              {t("driveRequests.rejectionReason")}:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                bgcolor: "error.lighter",
                color: "error.dark",
                p: 1.5,
                borderRadius: 1,
              }}
            >
              {request.rejection_reason}
            </Typography>
          </Box>
        )}

        {/* Created Date */}
        <Typography variant="caption" color="text.secondary">
          {t("driveRequests.submitted")}{" "}
          {new Date(request.created_at).toLocaleDateString()}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
          {/* Driver Actions */}
          {userType === "driver" && (
            <>
              {request.status === "pending" && onEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => onEdit(request)}
                  sx={{ textTransform: "none" }}
                >
                  {t("common.edit")}
                </Button>
              )}
              {request.status === "pending" && onWithdraw && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => onWithdraw(request)}
                  sx={{ textTransform: "none" }}
                >
                  {t("driveRequests.withdraw")}
                </Button>
              )}
            </>
          )}

          {/* Owner Actions */}
          {userType === "owner" && request.status === "pending" && (
            <>
              {onApprove && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<Check />}
                  onClick={() => onApprove(request)}
                  sx={{ textTransform: "none" }}
                >
                  {t("driveRequests.approve")}
                </Button>
              )}
              {onReject && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Close />}
                  onClick={() => onReject(request)}
                  sx={{ textTransform: "none" }}
                >
                  {t("driveRequests.reject")}
                </Button>
              )}
            </>
          )}

          {/* View Details (for messaging) */}
          {onViewDetails && (
            <Button
              size="small"
              variant="text"
              onClick={() => onViewDetails(request)}
              sx={{ textTransform: "none", ml: "auto" }}
            >
              {t("driveRequests.viewDetails")}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DriveRequestCard;
