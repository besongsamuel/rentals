import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  searchUsers,
  UserProfile,
} from "../services/adminService";

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await fetchAllUsers();
      setUsers(userData);
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
