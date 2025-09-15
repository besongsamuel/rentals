import {
  AccountCircle,
  Dashboard,
  DirectionsCar,
  Menu as MenuIcon,
  MoreVert,
  Settings,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current pathname from window.location for navigation highlighting
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    // Always use window.location for navigation to avoid Router context issues
    window.location.href = path;
    handleMobileMenuClose();
  };

  // Navigation items based on user type
  const getNavigationItems = () => {
    if (!profile) return [];

    const baseItems = [
      { label: t("dashboard.title"), path: "/", icon: <Dashboard /> },
    ];

    if (profile.user_type === "owner") {
      return [
        ...baseItems,
        { label: t("cars.addCar"), path: "/cars/new", icon: <DirectionsCar /> },
        {
          label: t("dashboard.manageAssignments"),
          path: "/",
          icon: <Settings />,
        },
      ];
    }

    return baseItems;
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

  // Update current path when component mounts
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Don't show header on login/signup pages
  if (!user) {
    return null;
  }

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar
          sx={{
            px: { xs: 1.5, sm: 3 },
            py: { xs: 0.5, sm: 1 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="div"
            onClick={handleTitleClick}
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.375rem" },
              color: "inherit",
              cursor: "pointer",
              lineHeight: 1.2,
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            {t("app.name")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1.5, md: 2 },
            }}
          >
            {profile && !isMobile && (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    fontSize: { sm: "0.875rem", md: "0.9rem" },
                    fontWeight: 500,
                  }}
                >
                  {t("app.welcome")}, {profile.full_name || user?.email}
                </Typography>

                {organization && (
                  <Chip
                    label={organization.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      display: { xs: "none", lg: "flex" },
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "inherit",
                      fontSize: "0.75rem",
                      height: 24,
                    }}
                  />
                )}

                <Chip
                  label={t(`profile.${profile.user_type}`)}
                  size="small"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "inherit",
                    textTransform: "capitalize",
                    fontSize: "0.75rem",
                    height: 24,
                  }}
                />
              </>
            )}

            {!profile && !isMobile && (
              <Typography
                variant="body2"
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontSize: { sm: "0.875rem", md: "0.9rem" },
                  fontWeight: 500,
                }}
              >
                {t("app.welcome")}, {user?.email}
              </Typography>
            )}

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <LanguageSwitcher />
            </Box>

            {isMobile ? (
              <>
                <IconButton
                  size="medium"
                  aria-label="account menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                  sx={{
                    p: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={handleMenuClose}
                    sx={{
                      py: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        width: "100%",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {profile?.full_name || user?.email}
                      </Typography>
                      {organization && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {organization.name}
                        </Typography>
                      )}
                      {profile && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {profile.user_type}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={handleSignOut}
                    sx={{
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <AccountCircle sx={{ mr: 1.5, fontSize: 20 }} />
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
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            backgroundColor: "background.paper",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {t("app.name")}
          </Typography>
          {profile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {profile.full_name || user?.email}
              </Typography>
              {organization && (
                <Typography variant="body2" color="text.secondary">
                  {organization.name}
                </Typography>
              )}
              <Chip
                label={t(`profile.${profile.user_type}`)}
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: "primary.main",
                  color: "white",
                  textTransform: "capitalize",
                }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {getNavigationItems().map((item, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <IconButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor:
                      currentPath === item.path
                        ? "primary.main"
                        : "transparent",
                    color: currentPath === item.path ? "white" : "text.primary",
                    "&:hover": {
                      backgroundColor:
                        currentPath === item.path
                          ? "primary.dark"
                          : "action.hover",
                    },
                    minWidth: 48,
                    minHeight: 48,
                  }}
                >
                  {item.icon}
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      currentPath === item.path
                        ? "primary.main"
                        : "text.primary",
                    fontWeight: currentPath === item.path ? 600 : 400,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <LanguageSwitcher />
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AccountCircle />}
            onClick={handleSignOut}
            sx={{
              borderColor: "error.main",
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
              },
            }}
          >
            {t("app.signOut")}
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
