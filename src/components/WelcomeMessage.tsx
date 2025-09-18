import { Box, Chip, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";

const WelcomeMessage: React.FC = () => {
  const { user, profile } = useUserContext();
  const { t } = useTranslation();

  if (!user || !profile) {
    return null;
  }

  return (
    <Box
      sx={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.3)",
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              color: "text.primary",
            }}
          >
            {t("app.welcome")}, {profile.full_name || user?.email}
          </Typography>
          <Chip
            label={t(`profile.${profile.user_type}`)}
            size="small"
            sx={{
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
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeMessage;
