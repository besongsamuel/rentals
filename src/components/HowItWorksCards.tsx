import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const HowItWorksCards: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
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
          gap: 3,
          mb: 3,
        }}
      >
        {/* Owner Steps Card */}
        <Card
          elevation={0}
          sx={{
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: 2,
            "&:hover": {
              boxShadow: "0 4px 20px rgba(46, 125, 50, 0.1)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "primary.main",
                textAlign: "center",
              }}
            >
              {t("auth.ownerSteps.title")}
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                {t("auth.ownerSteps.step1")}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                {t("auth.ownerSteps.step2")}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                {t("auth.ownerSteps.step3")}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0 }}>
                {t("auth.ownerSteps.step4")}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Driver Steps Card */}
        <Card
          elevation={0}
          sx={{
            border: "2px solid",
            borderColor: "secondary.main",
            borderRadius: 2,
            "&:hover": {
              boxShadow: "0 4px 20px rgba(255, 152, 0, 0.1)",
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "secondary.main",
                textAlign: "center",
              }}
            >
              {t("auth.driverSteps.title")}
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                {t("auth.driverSteps.step1")}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                {t("auth.driverSteps.step2")}
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0 }}>
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
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              fontStyle: "italic",
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
