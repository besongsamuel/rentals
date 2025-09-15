import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";
import { organizationService } from "../services/organizationService";
import { Organization } from "../types";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => {
  const { user, profile, signOut } = useUserContext();
  const { t } = useTranslation();
  const [organization, setOrganization] = useState<Organization | null>(null);

  const handleSignOut = async () => {
    await signOut();
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
    <AppBar position="static" sx={{ borderRadius: 0 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t("app.name")}
        </Typography>
        {profile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {t("app.welcome")}, {profile.full_name || user.email}
            </Typography>
            {organization && (
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.2)",
                  fontWeight: "medium",
                }}
              >
                {organization.name}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                textTransform: "capitalize",
              }}
            >
              {profile.user_type}
            </Typography>
            <LanguageSwitcher />
            <Button color="inherit" onClick={handleSignOut}>
              {t("app.signOut")}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
