import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DriveRequestCard from "../components/DriveRequestCard";
import { useUserContext } from "../contexts/UserContext";
import { assignmentRequestService } from "../services/assignmentRequestService";
import { CarAssignmentRequest } from "../types";

const DriverDriveRequests: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useUserContext();

  const [requests, setRequests] = useState<CarAssignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // Withdraw dialog
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [withdrawingRequest, setWithdrawingRequest] = useState<CarAssignmentRequest | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [profile?.id]);

  const loadRequests = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await assignmentRequestService.getDriverRequests(profile.id);

      if (fetchError) {
        throw fetchError;
      }

      setRequests(data);
    } catch (err: any) {
      console.error("Error loading requests:", err);
      setError(err.message || t("driveRequests.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawingRequest) return;

    try {
      setWithdrawing(true);
      const { error } = await assignmentRequestService.withdrawRequest(
        withdrawingRequest.id
      );

      if (error) {
        throw error;
      }

      // Reload requests
      await loadRequests();
      setWithdrawDialog(false);
      setWithdrawingRequest(null);
    } catch (err: any) {
      console.error("Error withdrawing request:", err);
      setError(err.message || t("driveRequests.withdrawError"));
    } finally {
      setWithdrawing(false);
    }
  };

  const openWithdrawDialog = (request: CarAssignmentRequest) => {
    setWithdrawingRequest(request);
    setWithdrawDialog(true);
  };

  // Filter requests by status
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const otherRequests = requests.filter(
    (r) => !["pending", "approved"].includes(r.status)
  );

  const getFilteredRequests = () => {
    switch (tabValue) {
      case 0:
        return pendingRequests;
      case 1:
        return approvedRequests;
      case 2:
        return otherRequests;
      default:
        return requests;
    }
  };

  const filteredRequests = getFilteredRequests();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#1D1D1F",
            mb: 1,
            fontSize: { xs: "1.75rem", sm: "2rem" },
          }}
        >
          {t("driveRequests.myRequests")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("driveRequests.driverSubtitle")}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab
            label={`${t("driveRequests.pending")} (${pendingRequests.length})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label={`${t("driveRequests.approved")} (${approvedRequests.length})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label={`${t("driveRequests.other")} (${otherRequests.length})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Requests Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid size={12} key={index}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredRequests.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("driveRequests.noRequests")}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {tabValue === 0
              ? t("driveRequests.noPendingRequests")
              : tabValue === 1
              ? t("driveRequests.noApprovedRequests")
              : t("driveRequests.noOtherRequests")}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRequests.map((request) => (
            <Grid size={12} key={request.id}>
              <DriveRequestCard
                request={request}
                userType="driver"
                onWithdraw={
                  request.status === "pending" ? openWithdrawDialog : undefined
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Withdraw Confirmation Dialog */}
      <Dialog
        open={withdrawDialog}
        onClose={() => !withdrawing && setWithdrawDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("driveRequests.confirmWithdraw")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("driveRequests.withdrawMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setWithdrawDialog(false)}
            disabled={withdrawing}
            sx={{ textTransform: "none" }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            color="error"
            disabled={withdrawing}
            sx={{ textTransform: "none" }}
          >
            {withdrawing ? t("common.loading") : t("driveRequests.withdraw")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DriverDriveRequests;
