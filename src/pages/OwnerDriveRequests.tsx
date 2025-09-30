import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DriveRequestCard from "../components/DriveRequestCard";
import DriveRequestMessaging from "../components/DriveRequestMessaging";
import { useUserContext } from "../contexts/UserContext";
import { assignmentRequestService } from "../services/assignmentRequestService";
import { CarAssignmentRequest } from "../types";

const OwnerDriveRequests: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useUserContext();

  const [requests, setRequests] = useState<CarAssignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectingRequest, setRejectingRequest] =
    useState<CarAssignmentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Approve dialog
  const [approveDialog, setApproveDialog] = useState(false);
  const [approvingRequest, setApprovingRequest] =
    useState<CarAssignmentRequest | null>(null);
  const [approving, setApproving] = useState(false);

  // Messaging dialog
  const [messagingDialog, setMessagingDialog] = useState(false);
  const [messagingRequest, setMessagingRequest] =
    useState<CarAssignmentRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, [profile?.id]);

  const loadRequests = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await assignmentRequestService.getOwnerRequests(profile.id);

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

  const handleApprove = async () => {
    if (!approvingRequest || !profile?.id) return;

    try {
      setApproving(true);
      const { error } = await assignmentRequestService.approveRequest(
        approvingRequest.id,
        profile.id
      );

      if (error) {
        throw error;
      }

      // Reload requests
      await loadRequests();
      setApproveDialog(false);
      setApprovingRequest(null);
    } catch (err: any) {
      console.error("Error approving request:", err);
      setError(err.message || t("driveRequests.approveError"));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest || !profile?.id) return;

    try {
      setRejecting(true);
      const { error } = await assignmentRequestService.rejectRequest(
        rejectingRequest.id,
        profile.id,
        rejectionReason
      );

      if (error) {
        throw error;
      }

      // Reload requests
      await loadRequests();
      setRejectDialog(false);
      setRejectingRequest(null);
      setRejectionReason("");
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      setError(err.message || t("driveRequests.rejectError"));
    } finally {
      setRejecting(false);
    }
  };

  const openApproveDialog = (request: CarAssignmentRequest) => {
    setApprovingRequest(request);
    setApproveDialog(true);
  };

  const openRejectDialog = (request: CarAssignmentRequest) => {
    setRejectingRequest(request);
    setRejectDialog(true);
  };

  const openMessagingDialog = (request: CarAssignmentRequest) => {
    setMessagingRequest(request);
    setMessagingDialog(true);
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
          {t("driveRequests.receivedRequests")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("driveRequests.ownerSubtitle")}
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
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab
            label={`${t("driveRequests.pending")} (${pendingRequests.length})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label={`${t("driveRequests.approved")} (${
              approvedRequests.length
            })`}
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
              <Skeleton
                variant="rectangular"
                height={250}
                sx={{ borderRadius: 3 }}
              />
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
              ? t("driveRequests.noPendingRequestsOwner")
              : tabValue === 1
              ? t("driveRequests.noApprovedRequestsOwner")
              : t("driveRequests.noOtherRequestsOwner")}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRequests.map((request) => (
            <Grid size={12} key={request.id}>
              <DriveRequestCard
                request={request}
                userType="owner"
                onApprove={
                  request.status === "pending" ? openApproveDialog : undefined
                }
                onReject={
                  request.status === "pending" ? openRejectDialog : undefined
                }
                onViewDetails={openMessagingDialog}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialog}
        onClose={() => !approving && setApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("driveRequests.confirmApprove")}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("driveRequests.approveMessage")}
          </Typography>
          {approvingRequest && (
            <Box
              sx={{
                bgcolor: "background.default",
                p: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {(approvingRequest as any).cars?.make}{" "}
                {(approvingRequest as any).cars?.model}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("driveRequests.driver")}:{" "}
                {(approvingRequest as any).profiles?.full_name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setApproveDialog(false)}
            disabled={approving}
            sx={{ textTransform: "none" }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={approving}
            sx={{ textTransform: "none" }}
          >
            {approving ? t("common.loading") : t("driveRequests.approve")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => !rejecting && setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("driveRequests.confirmReject")}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {t("driveRequests.rejectMessage")}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t("driveRequests.rejectionReason")}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            helperText={t("driveRequests.rejectionReasonHelper")}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setRejectDialog(false)}
            disabled={rejecting}
            sx={{ textTransform: "none" }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={rejecting}
            sx={{ textTransform: "none" }}
          >
            {rejecting ? t("common.loading") : t("driveRequests.reject")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Messaging Dialog */}
      {messagingRequest && (
        <DriveRequestMessaging
          open={messagingDialog}
          onClose={() => setMessagingDialog(false)}
          request={messagingRequest}
        />
      )}
    </Container>
  );
};

export default OwnerDriveRequests;
