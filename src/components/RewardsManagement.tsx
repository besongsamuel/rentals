import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchAllRewardAccounts,
  fetchAllWithdrawalRequests,
  processWithdrawalRequest,
  RewardAccount,
  WithdrawalRequest,
} from "../services/adminService";

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
      id={`rewards-tabpanel-${index}`}
      aria-labelledby={`rewards-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export const RewardsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [rewardAccounts, setRewardAccounts] = useState<RewardAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalRequest | null>(null);
  const [newStatus, setNewStatus] = useState<
    "processing" | "completed" | "rejected" | "cancelled"
  >("completed");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [withdrawals, accounts] = await Promise.all([
        fetchAllWithdrawalRequests(),
        fetchAllRewardAccounts(),
      ]);
      console.log("withdrawals", withdrawals);
      console.log("accounts", accounts);
      setWithdrawalRequests(withdrawals);
      setRewardAccounts(accounts);
    } catch (error) {
      console.error("Failed to load rewards data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await processWithdrawalRequest(
        selectedRequest.id,
        newStatus,
        newStatus === "rejected" ? rejectionReason : undefined,
        adminNotes || undefined
      );

      setAlert({
        type: "success",
        message: t("admin.withdrawalProcessed"),
      });

      setProcessDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
      setAdminNotes("");

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Failed to process withdrawal:", error);
      setAlert({
        type: "error",
        message: t("admin.withdrawalError"),
      });
    } finally {
      setProcessing(false);
    }
  };

  const openProcessDialog = (
    request: WithdrawalRequest,
    status: "processing" | "completed" | "rejected" | "cancelled"
  ) => {
    setSelectedRequest(request);
    setNewStatus(status);
    setProcessDialogOpen(true);
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: "warning" as const, icon: <PendingIcon /> },
      processing: { color: "info" as const, icon: <PendingIcon /> },
      completed: { color: "success" as const, icon: <CheckCircleIcon /> },
      rejected: { color: "error" as const, icon: <CancelIcon /> },
      cancelled: { color: "default" as const, icon: <CancelIcon /> },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Chip
        label={t(`admin.${status}`)}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const withdrawalColumns: GridColDef[] = [
    {
      field: "user_profile",
      headerName: t("admin.name"),
      width: 200,
      renderCell: (params) =>
        params.value?.full_name || t("common.notProvided"),
    },
    {
      field: "user_profile",
      headerName: t("admin.email"),
      width: 250,
      renderCell: (params) => params.value?.email,
    },
    {
      field: "status",
      headerName: t("admin.status"),
      width: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: "user_notes",
      headerName: t("admin.userNotes"),
      width: 300,
      renderCell: (params) => (
        <Tooltip title={params.value || ""}>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {params.value || t("common.notProvided")}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "created_at",
      headerName: t("admin.requestedAt"),
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("admin.actions"),
      width: 200,
      getActions: (params) => {
        const actions = [];

        if (params.row.status === "pending") {
          actions.push(
            <GridActionsCellItem
              icon={<CheckCircleIcon />}
              label={t("admin.approve")}
              onClick={() => openProcessDialog(params.row, "completed")}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label={t("admin.reject")}
              onClick={() => openProcessDialog(params.row, "rejected")}
            />
          );
        }

        return actions;
      },
    },
  ];

  const rewardColumns: GridColDef[] = [
    {
      field: "user_profile",
      headerName: t("admin.name"),
      width: 200,
      renderCell: (params) =>
        params.value?.full_name || t("common.notProvided"),
    },
    {
      field: "user_profile",
      headerName: t("admin.email"),
      width: 250,
      renderCell: (params) => params.value?.email,
    },
    {
      field: "balance_cents",
      headerName: t("admin.balance"),
      width: 150,
      renderCell: (params) => {
        const amount = (params.value / 100).toFixed(2);
        return `${params.row.currency} ${amount}`;
      },
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("admin.rewardsManagement")}
          </Typography>
          <Skeleton variant="rectangular" height={400} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{t("admin.rewardsManagement")}</Typography>
          <IconButton onClick={loadData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {alert && (
          <Alert
            severity={alert.type}
            onClose={() => setAlert(null)}
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
          >
            <Tab
              label={`${t("admin.withdrawalRequests")} (${
                withdrawalRequests.length
              })`}
              icon={<AccountBalanceWalletIcon />}
            />
            <Tab
              label={`${t("admin.rewardAccounts")} (${rewardAccounts.length})`}
              icon={<AccountBalanceWalletIcon />}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={withdrawalRequests}
              columns={withdrawalColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              slots={{
                toolbar: GridToolbar,
              }}
              getRowId={(row) => row.id}
              loading={loading}
              sx={{
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f0f0f0",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={rewardAccounts}
              columns={rewardColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              slots={{
                toolbar: GridToolbar,
              }}
              getRowId={(row) => row.user_id}
              loading={loading}
              sx={{
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f0f0f0",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />
          </Box>
        </TabPanel>

        {/* Process Withdrawal Dialog */}
        <Dialog
          open={processDialogOpen}
          onClose={() => setProcessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t("admin.processWithdrawal")} -{" "}
            {selectedRequest?.user_profile?.full_name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t("admin.userNotes")}:{" "}
                {selectedRequest?.user_notes || t("common.notProvided")}
              </Typography>
            </Box>

            {newStatus === "rejected" && (
              <TextField
                fullWidth
                label={t("admin.rejectionReasonLabel")}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                margin="normal"
                required
              />
            )}

            <TextField
              fullWidth
              label={t("admin.adminNotesLabel")}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setProcessDialogOpen(false)}
              disabled={processing}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleProcessRequest}
              variant="contained"
              disabled={
                processing ||
                (newStatus === "rejected" && !rejectionReason.trim())
              }
            >
              {processing
                ? t("admin.processing")
                : t("admin.processWithdrawal")}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RewardsManagement;
