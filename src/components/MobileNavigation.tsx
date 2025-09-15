import {
  AccountCircle,
  Add,
  Dashboard,
  Menu as MenuIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import LanguageSwitcher from "./LanguageSwitcher";

const drawerWidth = 280;

interface MobileNavigationProps {
  children: React.ReactNode;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useUserContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
  };

  const navigationItems = [
    {
      text: t("dashboard.title"),
      icon: <Dashboard />,
      path: "/",
    },
    {
      text: t("cars.addCar"),
      icon: <Add />,
      path: "/cars/new",
    },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t("app.name")}
        </Typography>
      </Toolbar>

      {profile && (
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountCircle color="primary" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {profile.full_name || user?.email}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: "capitalize" }}
              >
                {profile.user_type}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <LanguageSwitcher />
        </Box>

        <ListItemButton
          onClick={handleSignOut}
          sx={{
            borderRadius: 2,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "error.contrastText",
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary={t("app.signOut")} />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t("app.name")}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MobileNavigation;
