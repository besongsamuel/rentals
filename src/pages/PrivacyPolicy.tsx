import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f2f7" }}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        {/* Logo and Brand */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box
            component="img"
            src="/site-logo-800x800.png"
            alt="mo kumbi"
            onClick={() => navigate("/")}
            sx={{
              height: 48,
              width: "auto",
              mb: 2,
              cursor: "pointer",
              transition: "opacity 0.2s ease-in-out",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textAlign: "center",
              mb: 1,
            }}
          >
            <Box component="span" sx={{ color: "error.main" }}>
              mo
            </Box>{" "}
            <Box component="span" sx={{ color: "warning.main" }}>
              kumbi
            </Box>
          </Typography>
        </Box>

        {/* Privacy Policy Content */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 800,
            p: { xs: 3, sm: 4, md: 5 },
            background: "#ffffff",
            border: "0.5px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            sx={{
              fontWeight: 400,
              textAlign: "center",
              color: "#1d1d1f",
              mb: 4,
              fontSize: { xs: "1.75rem", sm: "2.25rem" },
              letterSpacing: "-0.01em",
            }}
          >
            {t("legal.privacyPolicy")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#86868b",
              textAlign: "center",
              mb: 4,
              fontSize: "0.875rem",
            }}
          >
            {t("legal.lastUpdated")}: {new Date().toLocaleDateString()}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: "#1d1d1f",
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              {t("legal.introduction")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.privacyIntroduction")}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: "#1d1d1f",
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              {t("legal.informationWeCollect")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 2,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.personalInformation")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.usageInformation")}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: "#1d1d1f",
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              {t("legal.howWeUseInformation")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.useInformationDescription")}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: "#1d1d1f",
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              {t("legal.dataSharing")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.dataSharingDescription")}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: "#1d1d1f",
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              {t("legal.dataSecurity")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.dataSecurityDescription")}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: "#1d1d1f",
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              {t("legal.yourRights")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.yourRightsDescription")}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 400,
                color: "#1d1d1f",
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              {t("legal.contactUs")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#1d1d1f",
                lineHeight: 1.6,
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              {t("legal.contactUsDescription")}
            </Typography>
          </Box>

          {/* Back Button */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "0.875rem",
                fontWeight: 400,
                borderColor: "#007AFF",
                color: "#007AFF",
                borderRadius: 2,
                textTransform: "none",
                letterSpacing: "-0.01em",
                "&:hover": {
                  backgroundColor: "rgba(0, 122, 255, 0.05)",
                  borderColor: "#0056CC",
                },
              }}
            >
              {t("common.back")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
