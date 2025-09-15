import { AccountCircle, MoreVert } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";
import { organizationService } from "../services/organizationService";
import { Organization } from "../types";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => {
  const { user, profile, signOut } = useUserContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSignOut = async () => {
    await signOut();
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTitleClick = () => {
    // Use window.location to navigate to home
    window.location.href = "/";
  };

  // Load organization data when profile is available
  useEffect(() => {
    const loadOrganization = async () => {
      if (profile?.organization_id) {
        try {
          const org = await organizationService.getOrganizationById(
            profile.organization_id
          );
          setOrganization(org);
        } catch (error) {
          console.error("Error loading organization:", error);
        }
      }
    };

    loadOrganization();
  }, [profile?.organization_id]);

  // Don't show header on login/signup pages
  if (!user) {
    return null;
  }

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          component="div"
          onClick={handleTitleClick}
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            color: "inherit",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {t("app.name")}
        </Typography>

        {profile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            }}
          >
            {!isMobile && (
              <>
                <Typography
                  variant="body2"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {t("app.welcome")}, {profile.full_name || user?.email}
                </Typography>

                {organization && (
                  <Chip
                    label={organization.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      display: { xs: "none", md: "flex" },
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "inherit",
                    }}
                  />
                )}

                <Chip
                  label={profile.user_type}
                  size="small"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "inherit",
                    textTransform: "capitalize",
                  }}
                />
              </>
            )}

            <LanguageSwitcher />

            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  aria-label="account menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {profile.full_name || user?.email}
                      </Typography>
                      {organization && (
                        <Typography variant="caption" color="text.secondary">
                          {organization.name}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {profile.user_type}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    {t("app.signOut")}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={handleSignOut}
                startIcon={<AccountCircle />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                {t("app.signOut")}
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
