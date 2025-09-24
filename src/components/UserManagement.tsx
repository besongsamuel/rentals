import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Skeleton,
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
  fetchAllUsers,
  fetchUserStatistics,
  searchUsers,
  UserProfile,
  UserStatistics,
} from "../services/adminService";

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [userData, statsData] = await Promise.all([
        fetchAllUsers(),
        fetchUserStatistics(),
      ]);
      setUsers(userData);
      setStatistics(statsData);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadUsers();
      return;
    }

    setSearchLoading(true);
    try {
      const searchResults = await searchUsers(searchTerm.trim());
      setUsers(searchResults);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "full_name",
      headerName: t("admin.name"),
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          {params.value || t("common.notProvided")}
        </Box>
      ),
    },
    {
      field: "email",
      headerName: t("admin.email"),
      width: 250,
    },
    {
      field: "phone",
      headerName: t("admin.phone"),
      width: 150,
      renderCell: (params) => params.value || t("common.notProvided"),
    },
    {
      field: "user_type",
      headerName: t("admin.userType"),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.value === "driver" ? t("admin.driver") : t("admin.owner")
          }
          color={params.value === "driver" ? "primary" : "secondary"}
          size="small"
        />
      ),
    },
    {
      field: "is_admin",
      headerName: t("admin.isAdmin"),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "created_at",
      headerName: t("admin.createdAt"),
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("admin.actions"),
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title={t("admin.viewProfile")}>
              <PersonIcon />
            </Tooltip>
          }
          label={t("admin.viewProfile")}
          onClick={() => {
            // Navigate to user profile or show user details
            console.log("View profile for user:", params.row.id);
          }}
        />,
      ],
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("admin.userManagement")}
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
          <Typography variant="h6">{t("admin.userManagement")}</Typography>
          <IconButton onClick={loadUsers} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* User Statistics */}
        {statistics && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {t("admin.userStatistics")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    {statistics.total_users}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("admin.totalUsers")}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    {statistics.total_drivers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("admin.totalDrivers")}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    color="secondary"
                    sx={{ fontWeight: 700 }}
                  >
                    {statistics.total_owners}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("admin.totalOwners")}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={{ fontWeight: 700 }}
                  >
                    {statistics.total_admins}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("admin.totalAdmins")}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Users by Country */}
            {statistics.users_by_country.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  {t("admin.usersByCountry")}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {statistics.users_by_country.slice(0, 10).map((country) => (
                    <Chip
                      key={country.country}
                      label={`${country.country}: ${country.count}`}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                  {statistics.users_by_country.length > 10 && (
                    <Chip
                      label={`+${statistics.users_by_country.length - 10} more`}
                      variant="outlined"
                      size="small"
                      color="default"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder={t("admin.searchUsers")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "action.active" }} />
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading}
            startIcon={<SearchIcon />}
          >
            {t("common.search")}
          </Button>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
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
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            getRowId={(row) => row.id}
            loading={searchLoading}
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
      </CardContent>
    </Card>
  );
};

export default UserManagement;
