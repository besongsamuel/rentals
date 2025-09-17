import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const HowItWorksCards: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mb: 4,
          color: "text.primary",
        }}
      >
        {t("auth.howItWorks")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 4,
          mb: 4,
        }}
      >
        {/* Owner Steps Card */}
        <Card
          elevation={0}
          sx={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            "&:hover": {
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              {t("auth.ownerSteps.title")}
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography
                component="li"
                variant="body1"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                {t("auth.ownerSteps.step1")}
              </Typography>
              <Typography
                component="li"
                variant="body1"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                {t("auth.ownerSteps.step2")}
              </Typography>
              <Typography
                component="li"
                variant="body1"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                {t("auth.ownerSteps.step3")}
              </Typography>
              <Typography
                component="li"
                variant="body1"
                sx={{ mb: 0, fontWeight: 500 }}
              >
                {t("auth.ownerSteps.step4")}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Driver Steps Card */}
        <Card
          elevation={0}
          sx={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            "&:hover": {
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              {t("auth.driverSteps.title")}
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography
                component="li"
                variant="body1"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                {t("auth.driverSteps.step1")}
              </Typography>
              <Typography
                component="li"
                variant="body1"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                {t("auth.driverSteps.step2")}
              </Typography>
              <Typography
                component="li"
                variant="body1"
                sx={{ mb: 0, fontWeight: 500 }}
              >
                {t("auth.driverSteps.step3")}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* System Description */}
      <Card
        elevation={0}
        sx={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          "&:hover": {
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 2,
            }}
          >
            {t("common.about")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              lineHeight: 1.7,
            }}
          >
            {t("auth.systemDescription")}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HowItWorksCards;
