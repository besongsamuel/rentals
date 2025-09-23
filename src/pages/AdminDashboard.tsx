import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import {
  Alert,
  Box,
  Container,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import RewardsManagement from "../components/RewardsManagement";
import UserManagement from "../components/UserManagement";
import { useAuth } from "../hooks/useAuth";
import { verifyAdminAccess } from "../services/adminService";

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [adminAccess, setAdminAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;

      if (!user) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const hasAccess = await verifyAdminAccess();
        setAdminAccess(hasAccess);

        if (!hasAccess) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Failed to verify admin access:", error);
        setAdminAccess(false);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={500} height={24} />
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (adminAccess === false) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You do not have admin privileges to access this page.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <AdminPanelSettingsIcon
            sx={{ fontSize: 32, color: "primary.main" }}
          />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {t("admin.title")}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage users and process reward withdrawals
        </Typography>
      </Box>

      {/* Admin Modules */}
      <Grid container spacing={3}>
        {/* User Management */}
        <Grid size={{ xs: 12 }}>
          <UserManagement />
        </Grid>

        {/* Rewards Management */}
        <Grid size={{ xs: 12 }}>
          <RewardsManagement />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
