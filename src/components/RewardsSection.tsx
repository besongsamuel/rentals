import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import {
  createWithdrawalRequest,
  fetchReferrals,
  fetchRewardAccount,
  inviteUser,
} from "../services/rewardsService";

type Props = {
  sx?: any;
};

export const RewardsSection: React.FC<Props> = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<{
    balance_cents: number;
    currency: string;
  } | null>(null);
  const [referrals, setReferrals] = useState<
    Array<{
      id: string;
      invitee_email: string | null;
      invitee_user_id: string | null;
      referral_code: string;
      status: string;
    }>
  >([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [lastReferralCode, setLastReferralCode] = useState<string | null>(null);
  const [invitationsExpanded, setInvitationsExpanded] = useState(true);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalNotes, setWithdrawalNotes] = useState("");
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const [acc, refs] = await Promise.all([
          fetchRewardAccount(),
          fetchReferrals(),
        ]);
        if (!active) return;
        setAccount(
          acc
            ? { balance_cents: acc.balance_cents, currency: acc.currency }
            : { balance_cents: 0, currency: "CAD" }
        );
        setReferrals(refs);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (!authLoading) load();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const balance = useMemo(() => {
    const cents = account?.balance_cents ?? 0;
    return (cents / 100).toFixed(2);
  }, [account]);

  const canWithdraw = (account?.balance_cents ?? 0) >= 2000;

  async function handleInvite() {
    if (!user) return;
    setCreating(true);
    try {
      const res = await inviteUser(user.id, inviteEmail || null);
      setLastReferralCode(res.referral_code);
      const refs = await fetchReferrals();
      setReferrals(refs);
      setInviteEmail("");
    } catch (e) {
      // Swallow error; could integrate toasts
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  function copyReferral() {
    if (!lastReferralCode) return;
    const link = `${window.location.origin}/signup?ref=${encodeURIComponent(
      lastReferralCode
    )}`;
    navigator.clipboard.writeText(link);
  }

  async function handleWithdrawalRequest() {
    if (!withdrawalNotes.trim()) return;

    setProcessingWithdrawal(true);
    try {
      await createWithdrawalRequest(withdrawalNotes.trim());
      setWithdrawalDialogOpen(false);
      setWithdrawalNotes("");
      // Refresh account data to show updated balance
      const acc = await fetchRewardAccount();
      if (acc) {
        setAccount({
          balance_cents: acc.balance_cents,
          currency: acc.currency,
        });
      }
    } catch (error) {
      console.error("Withdrawal request failed:", error);
      // Could show error toast here
    } finally {
      setProcessingWithdrawal(false);
    }
  }

  function handleWithdrawalDialogClose() {
    setWithdrawalDialogOpen(false);
    setWithdrawalNotes("");
  }

  return (
    <Grid container spacing={2} sx={{ width: "100%", mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {t("rewards.title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                {t("rewards.subtitle").split(":")[0]}:
              </span>{" "}
              <span style={{ color: "rgba(0, 0, 0, 0.6)" }}>
                {t("rewards.subtitle").split(":").slice(1).join(":").trim()}
              </span>
            </Typography>

            <Grid container spacing={2} sx={{ width: "100%" }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                {loading ? (
                  <Skeleton variant="rounded" height={74} />
                ) : (
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "rgba(46,125,50,0.08)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {t("rewards.currentBalance")}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {account?.currency ?? "CAD"} {balance}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={canWithdraw ? "success.main" : "text.secondary"}
                      sx={{ mb: 1, display: "block" }}
                    >
                      {canWithdraw
                        ? t("rewards.canWithdraw")
                        : t("rewards.withdrawalsAvailable")}
                    </Typography>
                    {canWithdraw && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={() => setWithdrawalDialogOpen(true)}
                        disabled={loading}
                        sx={{ width: "100%" }}
                      >
                        {t("rewards.withdraw")}
                      </Button>
                    )}
                  </Card>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                <Card sx={{ p: 2, borderRadius: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {t("rewards.howItWorks")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    - {t("rewards.step1")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    - {t("rewards.step2")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    - {t("rewards.step3")}
                  </Typography>

                  <Grid container spacing={1} sx={{ width: "100%" }}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="email"
                        label={t("rewards.inviteByEmail")}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<SendIcon />}
                        onClick={handleInvite}
                        disabled={creating || authLoading}
                        sx={{ height: 40 }}
                      >
                        {t("rewards.inviteUser")}
                      </Button>
                    </Grid>
                  </Grid>

                  {lastReferralCode && (
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption">
                          {t("rewards.shareThisLink")}
                        </Typography>
                      </Grid>
                      <Grid
                        size={{ xs: 12 }}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {`${
                            window.location.origin
                          }/signup?ref=${encodeURIComponent(lastReferralCode)}`}
                        </Typography>
                        <Tooltip title={t("rewards.copyLink")}>
                          <IconButton
                            onClick={copyReferral}
                            size="small"
                            sx={{ ml: "auto" }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )}
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginBottom: invitationsExpanded ? 8 : 0,
                      }}
                      onClick={() =>
                        setInvitationsExpanded(!invitationsExpanded)
                      }
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ flexGrow: 1 }}
                      >
                        {t("rewards.yourInvitations")} ({referrals.length})
                      </Typography>
                      <IconButton size="small">
                        {invitationsExpanded ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </div>
                    <Collapse in={invitationsExpanded}>
                      {loading ? (
                        <>
                          <Skeleton height={32} />
                          <Skeleton height={32} />
                          <Skeleton height={32} />
                        </>
                      ) : referrals.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          {t("rewards.noInvitations")}
                        </Typography>
                      ) : (
                        <List dense>
                          {referrals.map((r) => (
                            <ListItem key={r.id} divider>
                              <ListItemText
                                primary={
                                  r.invitee_email ||
                                  `${t("rewards.code")}: ${r.referral_code}`
                                }
                                secondary={
                                  r.status === "accepted"
                                    ? t("rewards.signedUp")
                                    : t("rewards.pending")
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Withdrawal Request Dialog */}
      <Dialog
        open={withdrawalDialogOpen}
        onClose={handleWithdrawalDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("rewards.withdrawalDialogTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("rewards.withdrawalDialogDescription", {
              amount: balance,
              currency: account?.currency ?? "CAD",
            })}
          </DialogContentText>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t("rewards.withdrawalInstructions")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("rewards.withdrawalInstructionsHelper")}
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label={t("rewards.withdrawalNotes")}
            placeholder={t("rewards.withdrawalNotesPlaceholder")}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={withdrawalNotes}
            onChange={(e) => setWithdrawalNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleWithdrawalDialogClose}
            disabled={processingWithdrawal}
          >
            {t("rewards.cancelWithdrawal")}
          </Button>
          <Button
            onClick={handleWithdrawalRequest}
            variant="contained"
            disabled={!withdrawalNotes.trim() || processingWithdrawal}
            startIcon={<AccountBalanceWalletIcon />}
          >
            {processingWithdrawal
              ? t("rewards.processingWithdrawal")
              : t("rewards.submitWithdrawal")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default RewardsSection;
