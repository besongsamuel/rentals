import {
  AccountCircle,
  AdminPanelSettings,
  Analytics,
  Close,
  Dashboard,
  DirectionsCar,
  Menu as MenuIcon,
  MoreVert,
  Person,
  RequestPage,
  Search,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";
import {
  getUserTypeBackgroundColor,
  getUserTypeTextColor,
} from "../utils/userTypeColors";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => {
  const { user, profile, signOut } = useUserContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.down("lg"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [secondaryMenuAnchor, setSecondaryMenuAnchor] =
    useState<null | HTMLElement>(null);

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

  const handleSecondaryMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSecondaryMenuAnchor(event.currentTarget);
  };

  const handleSecondaryMenuClose = () => {
    setSecondaryMenuAnchor(null);
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
      {
        label: t("dashboard.title"),
        shortLabel: "Home",
        path: "/",
        icon: <Dashboard />,
        priority: "high",
      },
      {
        label: "Analytics",
        shortLabel: "Stats",
        path: "/analytics",
        icon: <Analytics />,
        priority: "medium",
      },
      {
        label: "Profile",
        shortLabel: "Profile",
        path: "/profile",
        icon: <Person />,
        priority: "medium",
      },
    ];

    // Add admin link if user is admin
    if (profile.is_admin) {
      baseItems.push({
        label: t("admin.admin"),
        shortLabel: "Admin",
        path: "/admin",
        icon: <AdminPanelSettings />,
        priority: "high",
      });
    }

    if (profile.user_type === "owner") {
      return [
        ...baseItems,
        {
          label: "Find Drivers",
          shortLabel: "Drivers",
          path: "/drivers",
          icon: <Person />,
          priority: "high",
        },
        {
          label: t("driveRequests.menuTitle"),
          shortLabel: "Requests",
          path: "/drive-requests",
          icon: <RequestPage />,
          priority: "medium",
        },
      ];
    }

    if (profile.user_type === "driver") {
      return [
        ...baseItems,
        {
          label: "Assigned Cars",
          shortLabel: "Cars",
          path: "/assigned-cars",
          icon: <DirectionsCar />,
          priority: "high",
        },
        {
          label: t("cars.search.menuTitle"),
          shortLabel: "Search",
          path: "/search-cars",
          icon: <Search />,
          priority: "high",
        },
        {
          label: t("driveRequests.menuTitle"),
          shortLabel: "Requests",
          path: "/drive-requests",
          icon: <RequestPage />,
          priority: "medium",
        },
      ];
    }

    return baseItems;
  };

  // Get primary navigation items (high priority) for desktop
  const getPrimaryNavigationItems = () => {
    const highPriorityItems = getNavigationItems().filter(
      (item) => item.priority === "high"
    );

    // On smaller desktop screens, show only the most essential items
    if (isSmallDesktop && !isMobile) {
      return highPriorityItems.slice(0, 2); // Show only first 2 items
    }

    return highPriorityItems;
  };

  // Get secondary navigation items (medium priority) for dropdown
  const getSecondaryNavigationItems = () => {
    const mediumPriorityItems = getNavigationItems().filter(
      (item) => item.priority === "medium"
    );

    // On smaller desktop screens, also include remaining high-priority items
    if (isSmallDesktop && !isMobile) {
      const highPriorityItems = getNavigationItems().filter(
        (item) => item.priority === "high"
      );
      const remainingHighPriorityItems = highPriorityItems.slice(2); // Items after the first 2
      return [...remainingHighPriorityItems, ...mediumPriorityItems];
    }

    return mediumPriorityItems;
  };

  // Update current path when component mounts
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Show simplified header for non-authenticated users
  if (!user) {
    return (
      <>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "#1d1d1f",
            borderBottom: "0.5px solid rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <Toolbar
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: 0,
              minHeight: { xs: 60, sm: 64 },
              maxWidth: "1200px",
              mx: "auto",
              width: "100%",
            }}
          >
            {/* Logo and Brand */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.7,
                },
                transition: "opacity 0.2s ease",
              }}
              onClick={() => (window.location.href = "/")}
            >
              <Box
                component="img"
                src="/site-logo-800x800.png"
                alt="mo kumbi"
                sx={{
                  height: { xs: 24, sm: 28 },
                  width: "auto",
                  mr: 1.5,
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    fontSize: { xs: "1.1rem", sm: "1.2rem" },
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  <Box component="span" sx={{ color: "error.main" }}>
                    mo
                  </Box>{" "}
                  <Box component="span" sx={{ color: "warning.main" }}>
                    kumbi
                  </Box>
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontSize: "0.6rem",
                    color: "#86868b",
                    letterSpacing: "-0.01em",
                    textTransform: "lowercase",
                    lineHeight: 1,
                  }}
                >
                  {t("auth.driverSubtext")}
                </Typography>
              </Box>
            </Box>

            {/* Right Side Actions */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                ml: "auto",
              }}
            >
              {/* Language Switcher */}
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <LanguageSwitcher />
              </Box>

              {/* Navigation Links */}
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 0,
                  ml: 2,
                }}
              >
                <Button
                  color="inherit"
                  onClick={() => (window.location.href = "/how-it-works")}
                  sx={{
                    px: 2,
                    py: 1,
                    minWidth: "auto",
                    fontSize: "0.9rem",
                    fontWeight: 400,
                    color: "#86868b",
                    textTransform: "none",
                    letterSpacing: "-0.01em",
                    "&:hover": {
                      color: "#1d1d1f",
                      backgroundColor: "transparent",
                    },
                    transition: "color 0.2s ease",
                  }}
                >
                  {t("howItWorks.faq")}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => (window.location.href = "/login")}
                  sx={{
                    px: 2,
                    py: 1,
                    minWidth: "auto",
                    fontSize: "0.9rem",
                    fontWeight: 400,
                    color: currentPath === "/login" ? "#007AFF" : "#86868b",
                    textTransform: "none",
                    letterSpacing: "-0.01em",
                    "&:hover": {
                      color: currentPath === "/login" ? "#0056CC" : "#1d1d1f",
                      backgroundColor: "transparent",
                    },
                    transition: "color 0.2s ease",
                  }}
                >
                  {t("auth.login")}
                </Button>
                <Button
                  color="inherit"
                  onClick={() => (window.location.href = "/signup")}
                  sx={{
                    px: 2,
                    py: 1,
                    minWidth: "auto",
                    fontSize: "0.9rem",
                    fontWeight: 400,
                    color: currentPath === "/signup" ? "#007AFF" : "#86868b",
                    textTransform: "none",
                    letterSpacing: "-0.01em",
                    "&:hover": {
                      color: currentPath === "/signup" ? "#0056CC" : "#1d1d1f",
                      backgroundColor: "transparent",
                    },
                    transition: "color 0.2s ease",
                  }}
                >
                  {t("auth.signUp")}
                </Button>
              </Box>

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMobileMenuToggle}
                  sx={{
                    mr: 2,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <MenuIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </>
    );
  }

  return (
    <>
      {/* Apple-inspired Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#1d1d1f",
          borderBottom: "0.5px solid rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 0,
            minHeight: { xs: 60, sm: 64 },
            maxWidth: "1200px",
            mx: "auto",
            width: "100%",
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
                p: 1,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                transition: "background-color 0.2s ease",
              }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          {/* Logo and Brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.7,
              },
              transition: "opacity 0.2s ease",
            }}
            onClick={handleTitleClick}
          >
            <Box
              component="img"
              src="/site-logo-800x800.png"
              alt="mo kumbi"
              sx={{
                height: { xs: 24, sm: 28 },
                width: "auto",
                mr: 1.5,
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                <Box component="span" sx={{ color: "error.main" }}>
                  mo
                </Box>{" "}
                <Box component="span" sx={{ color: "warning.main" }}>
                  kumbi
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "0.6rem",
                  color: "#86868b",
                  letterSpacing: "-0.01em",
                  textTransform: "lowercase",
                  lineHeight: 1,
                }}
              >
                {t("auth.driverSubtext")}
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {profile && !isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                ml: 4,
                flexGrow: 1,
              }}
            >
              {/* Primary Navigation Items */}
              {getPrimaryNavigationItems().map((item, index) => (
                <Tooltip
                  key={index}
                  title={
                    isSmallDesktop && !isMobile && item.shortLabel
                      ? item.label
                      : ""
                  }
                  placement="bottom"
                  arrow
                >
                  <Button
                    color="inherit"
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      minWidth: "auto",
                      fontSize: "0.85rem",
                      fontWeight: 400,
                      color: currentPath === item.path ? "#1d1d1f" : "#86868b",
                      textTransform: "none",
                      letterSpacing: "-0.01em",
                      "&:hover": {
                        color: "#1d1d1f",
                        backgroundColor: "transparent",
                      },
                      transition: "color 0.2s ease",
                    }}
                  >
                    {isSmallDesktop && !isMobile && item.shortLabel
                      ? item.shortLabel
                      : item.label}
                  </Button>
                </Tooltip>
              ))}

              {/* More Menu for Secondary Items */}
              {getSecondaryNavigationItems().length > 0 && (
                <>
                  <Button
                    color="inherit"
                    onClick={handleSecondaryMenuOpen}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      minWidth: "auto",
                      fontSize: "0.85rem",
                      fontWeight: 400,
                      color: "#86868b",
                      textTransform: "none",
                      letterSpacing: "-0.01em",
                      "&:hover": {
                        color: "#1d1d1f",
                        backgroundColor: "transparent",
                      },
                      transition: "color 0.2s ease",
                    }}
                  >
                    More
                  </Button>
                  <Menu
                    anchorEl={secondaryMenuAnchor}
                    open={Boolean(secondaryMenuAnchor)}
                    onClose={handleSecondaryMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 180,
                        borderRadius: 2,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        border: "0.5px solid rgba(0, 0, 0, 0.1)",
                      },
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                  >
                    {getSecondaryNavigationItems().map((item, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          handleNavigation(item.path);
                          handleSecondaryMenuClose();
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {item.icon}
                          <Typography
                            sx={{
                              fontSize: "0.9rem",
                              fontWeight: 400,
                              color:
                                currentPath === item.path
                                  ? "#1d1d1f"
                                  : "#86868b",
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
          )}

          {/* Right Side Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              ml: "auto",
            }}
          >
            {/* Search Cars Button for Drivers on Mobile */}
            {profile?.user_type === "driver" && isMobile && (
              <Button
                size="small"
                aria-label="search cars"
                onClick={() => handleNavigation("/search-cars")}
                startIcon={<Search sx={{ fontSize: 18 }} />}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  minWidth: "auto",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: currentPath === "/search-cars" ? "#007AFF" : "#86868b",
                  backgroundColor:
                    currentPath === "/search-cars"
                      ? "rgba(0, 122, 255, 0.1)"
                      : "transparent",
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0, 122, 255, 0.15)",
                    color: "#007AFF",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {t("cars.search.menuTitle")}
              </Button>
            )}

            {/* User Type Badge */}
            {profile && !isMobile && (
              <Chip
                label={t(`profile.${profile.user_type}`)}
                size="small"
                sx={{
                  backgroundColor: getUserTypeBackgroundColor(
                    profile.user_type
                  ),
                  color: getUserTypeTextColor(profile.user_type),
                  textTransform: "capitalize",
                  fontSize: "0.75rem",
                  height: 24,
                  fontWeight: 400,
                  border: "none",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
            )}

            {/* Language Switcher */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <LanguageSwitcher />
            </Box>

            {/* Account Menu */}
            {isMobile ? (
              <IconButton
                size="small"
                aria-label="account menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
                sx={{
                  p: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                  transition: "background-color 0.2s ease",
                }}
              >
                <MoreVert sx={{ fontSize: 20 }} />
              </IconButton>
            ) : (
              <Button
                color="inherit"
                onClick={handleSignOut}
                sx={{
                  px: 2,
                  py: 1,
                  minWidth: "auto",
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  color: "#86868b",
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  "&:hover": {
                    color: "#1d1d1f",
                    backgroundColor: "transparent",
                  },
                  transition: "color 0.2s ease",
                }}
              >
                {t("app.signOut")}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Account Menu */}
      {isMobile && (
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
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              border: "0.5px solid rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <MenuItem
            onClick={handleMenuClose}
            sx={{
              py: 2,
              borderBottom: "0.5px solid rgba(0, 0, 0, 0.1)",
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
                sx={{
                  fontWeight: 400,
                  mb: 0.5,
                  fontSize: "0.9rem",
                  color: "#1d1d1f",
                }}
              >
                {profile?.full_name || user?.email}
              </Typography>
              {profile && (
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: "capitalize",
                    fontSize: "0.8rem",
                    color: "#86868b",
                  }}
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
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <Person sx={{ mr: 1.5, fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 400 }}>
              Profile
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={handleSignOut}
            sx={{
              py: 1.5,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <AccountCircle sx={{ mr: 1.5, fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 400 }}>
              {t("app.signOut")}
            </Typography>
          </MenuItem>
        </Menu>
      )}

      {/* Apple-inspired Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRight: "0.5px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        {/* Header with Close Button */}
        <Box
          sx={{
            p: 3,
            borderBottom: "0.5px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src="/site-logo-800x800.png"
              alt="mo kumbi"
              sx={{
                height: 24,
                width: "auto",
                mr: 1.5,
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  fontSize: "1.1rem",
                  letterSpacing: "-0.01em",
                }}
              >
                <Box component="span" sx={{ color: "error.main" }}>
                  mo
                </Box>{" "}
                <Box component="span" sx={{ color: "warning.main" }}>
                  kumbi
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "0.6rem",
                  color: "#86868b",
                  letterSpacing: "-0.01em",
                  textTransform: "lowercase",
                  lineHeight: 1,
                }}
              >
                {t("auth.driverSubtext")}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleMobileMenuClose}
            sx={{
              p: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              transition: "background-color 0.2s ease",
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* User Info */}
        {profile && (
          <Box sx={{ p: 3, borderBottom: "0.5px solid rgba(0, 0, 0, 0.1)" }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                fontSize: "0.9rem",
                color: "#1d1d1f",
                mb: 1,
              }}
            >
              {profile.full_name || user?.email}
            </Typography>
            <Chip
              label={t(`profile.${profile.user_type}`)}
              size="small"
              sx={{
                backgroundColor: getUserTypeBackgroundColor(profile.user_type),
                color: getUserTypeTextColor(profile.user_type),
                textTransform: "capitalize",
                fontSize: "0.75rem",
                height: 24,
                fontWeight: 400,
                border: "none",
                "& .MuiChip-label": {
                  px: 1.5,
                },
              }}
            />
          </Box>
        )}

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {getNavigationItems().map((item, index) => (
              <Button
                key={index}
                onClick={() => handleNavigation(item.path)}
                startIcon={item.icon}
                sx={{
                  justifyContent: "flex-start",
                  px: 2,
                  py: 1.5,
                  minHeight: 48,
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  color: currentPath === item.path ? "#1d1d1f" : "#86868b",
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    color: "#1d1d1f",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 2, borderTop: "0.5px solid rgba(0, 0, 0, 0.1)" }}>
          <LanguageSwitcher />
          <Button
            fullWidth
            onClick={handleSignOut}
            startIcon={<AccountCircle />}
            sx={{
              mt: 2,
              px: 2,
              py: 1.5,
              minHeight: 48,
              fontSize: "0.9rem",
              fontWeight: 400,
              color: "#86868b",
              textTransform: "none",
              letterSpacing: "-0.01em",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "#1d1d1f",
              },
              transition: "all 0.2s ease",
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
