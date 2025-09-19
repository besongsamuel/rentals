import { Email, Person, Phone, Work } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Profile } from "../types";

interface BasicInformationProps {
  profile: Profile | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ profile }) => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        background: "#ffffff",
        border: "0.5px solid rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar sx={{ bgcolor: "#007AFF", mr: 2 }}>
            <Person />
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: "#1D1D1F",
              letterSpacing: "-0.01em",
            }}
          >
            {t("dashboard.basicInformation")}
          </Typography>
        </Box>

        <Box sx={{ pl: 7 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Person sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.name")}:{" "}
              <strong>
                {profile?.full_name || t("dashboard.notProvided")}
              </strong>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Email sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.email")}:{" "}
              <strong>{profile?.email || t("dashboard.notProvided")}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Phone sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.phone")}:{" "}
              <strong>{profile?.phone || t("dashboard.notProvided")}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Work sx={{ mr: 1, fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.role")}:{" "}
              <strong>
                {profile?.user_type
                  ? profile.user_type.charAt(0).toUpperCase() +
                    profile.user_type.slice(1)
                  : t("profile.driver")}
              </strong>
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BasicInformation;
