import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
import { useAuth } from "../hooks/useAuth";
import {
  fetchReferrals,
  fetchRewardAccount,
  inviteUser,
} from "../services/rewardsService";

type Props = {
  sx?: any;
};

export const RewardsSection: React.FC<Props> = () => {
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

  return (
    <Grid container spacing={2} sx={{ width: "100%", mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Invite friends, drivers and owners and earn rewards
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Limited time offer: Invite friends and earn rewards.
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
                      Current Balance
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {account?.currency ?? "CAD"} {balance}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={canWithdraw ? "success.main" : "text.secondary"}
                    >
                      {canWithdraw
                        ? "You can request a withdrawal"
                        : "Withdrawals available at 20 CAD+"}
                    </Typography>
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
                    How it works
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    - Invite a user with the button below.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    - When they sign up, you’re credited 2 CAD.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    - Withdraw once your balance is over 20 CAD.
                  </Typography>

                  <Grid container spacing={1} sx={{ width: "100%" }}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="email"
                        label="Invite by email (optional)"
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
                        Invite User
                      </Button>
                    </Grid>
                  </Grid>

                  {lastReferralCode && (
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption">
                          Share this link with your invitee
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
                        <Tooltip title="Copy link">
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
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Your Invitations
                    </Typography>
                    {loading ? (
                      <>
                        <Skeleton height={32} />
                        <Skeleton height={32} />
                        <Skeleton height={32} />
                      </>
                    ) : referrals.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No invitations yet.
                      </Typography>
                    ) : (
                      <List dense>
                        {referrals.map((r) => (
                          <ListItem key={r.id} divider>
                            <ListItemText
                              primary={
                                r.invitee_email || `Code: ${r.referral_code}`
                              }
                              secondary={
                                r.status === "accepted"
                                  ? "Signed up"
                                  : "Pending"
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RewardsSection;
