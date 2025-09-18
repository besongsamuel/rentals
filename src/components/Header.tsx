import {
  AccountCircle,
  Dashboard,
  DirectionsCar,
  Menu as MenuIcon,
  MoreVert,
  Person,
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
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => {
  const { user, profile, signOut } = useUserContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
      { label: "Profile", path: "/profile", icon: <Person /> },
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
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderRadius: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#0f172a",
          borderBottom: "1px solid rgba(226, 232, 240, 0.3)",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, sm: 1.5 },
            minHeight: { xs: 64, sm: 72 },
          }}
        >
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{
                mr: 2,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              flexGrow: 1,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
            onClick={handleTitleClick}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box
                component="img"
                src="/app_logo.png"
                alt="ko kumba Logo"
                sx={{
                  height: "52px",
                  width: "auto",
                  display: "block",
                  mr: 2,
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                  display: { xs: "none", sm: "block" },
                  lineHeight: 1,
                  background:
                    "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                ko kumba
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1.5, md: 2 },
            }}
          >
            {/* Desktop Navigation Menu */}
            {profile && !isMobile && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}
              >
                {getNavigationItems().map((item, index) => (
                  <Button
                    key={index}
                    color="inherit"
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      backgroundColor:
                        currentPath === item.path
                          ? "rgba(46, 125, 50, 0.1)"
                          : "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color:
                        currentPath === item.path
                          ? "primary.main"
                          : "text.primary",
                      fontWeight: currentPath === item.path ? 600 : 500,
                      "&:hover": {
                        backgroundColor: "rgba(46, 125, 50, 0.15)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

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

                <Chip
                  label={t(`profile.${profile.user_type}`)}
                  size="small"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    backgroundColor: "rgba(46, 125, 50, 0.1)",
                    color: "primary.main",
                    textTransform: "capitalize",
                    fontSize: "0.75rem",
                    height: 28,
                    fontWeight: 600,
                    border: "1px solid rgba(46, 125, 50, 0.2)",
                    backdropFilter: "blur(10px)",
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
                    onClick={() => {
                      handleNavigation("/profile");
                      handleMenuClose();
                    }}
                    sx={{
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <Person sx={{ mr: 1.5, fontSize: 20 }} />
                    Profile
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
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                  border: "1px solid rgba(211, 47, 47, 0.2)",
                  color: "secondary.main",
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.15)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
                  },
                  transition: "all 0.2s ease-in-out",
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
            width: 300,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(226, 232, 240, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(226, 232, 240, 0.3)" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                component="img"
                src="/app_logo.png"
                alt="ko kumba Logo"
                sx={{
                  height: "48px",
                  width: "auto",
                  display: "block",
                  mr: 2,
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  background:
                    "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ko kumba
              </Typography>
            </Box>
          </Box>
          {profile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {profile.full_name || user?.email}
              </Typography>
              <Chip
                label={t(`profile.${profile.user_type}`)}
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: "rgba(46, 125, 50, 0.1)",
                  color: "primary.main",
                  textTransform: "capitalize",
                  fontWeight: 600,
                  border: "1px solid rgba(46, 125, 50, 0.2)",
                  backdropFilter: "blur(10px)",
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
                        ? "rgba(46, 125, 50, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                    color:
                      currentPath === item.path
                        ? "primary.main"
                        : "text.primary",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      backgroundColor:
                        currentPath === item.path
                          ? "rgba(46, 125, 50, 0.2)"
                          : "rgba(46, 125, 50, 0.1)",
                      transform: "scale(1.05)",
                    },
                    minWidth: 52,
                    minHeight: 52,
                    transition: "all 0.2s ease-in-out",
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
              borderColor: "rgba(211, 47, 47, 0.3)",
              color: "secondary.main",
              backgroundColor: "rgba(211, 47, 47, 0.05)",
              backdropFilter: "blur(10px)",
              fontWeight: 600,
              py: 1.5,
              borderRadius: 3,
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.1)",
                borderColor: "rgba(211, 47, 47, 0.5)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
              },
              transition: "all 0.2s ease-in-out",
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
