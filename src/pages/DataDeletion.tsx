import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const DataDeletion: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEmailClick = () => {
    window.location.href =
      "mailto:cto@aftermathtechnologies.com?subject=Data Deletion Request&body=Hello,%0D%0A%0D%0AI would like to request the deletion of my personal data from the mo kumbi platform.%0D%0A%0D%0APlease provide the following information:%0D%0A- Full name:%0D%0A- Email address:%0D%0A- User ID (if known):%0D%0A%0D%0AThank you for your assistance.%0D%0A%0D%0ABest regards";
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f2f7" }}>
      <Container
        component="main"
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: "#ffffff",
            border: "0.5px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 400,
              textAlign: "center",
              color: "#1d1d1f",
              mb: 4,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              letterSpacing: "-0.01em",
            }}
          >
            {t("dataDeletion.title")}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                fontSize: "1rem",
                lineHeight: 1.6,
                color: "#1d1d1f",
              }}
            >
              {t("dataDeletion.description")}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#1d1d1f",
              }}
            >
              {t("dataDeletion.howToRequest")}
            </Typography>

            <Box
              component="ol"
              sx={{
                pl: 3,
                mb: 3,
                "& li": {
                  mb: 1,
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "#1d1d1f",
                },
              }}
            >
              <li>{t("dataDeletion.step1")}</li>
              <li>{t("dataDeletion.step2")}</li>
              <li>{t("dataDeletion.step3")}</li>
              <li>{t("dataDeletion.step4")}</li>
            </Box>

            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#1d1d1f",
              }}
            >
              {t("dataDeletion.whatToInclude")}
            </Typography>

            <Box
              component="ul"
              sx={{
                pl: 3,
                mb: 3,
                "& li": {
                  mb: 1,
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "#1d1d1f",
                },
              }}
            >
              <li>{t("dataDeletion.include1")}</li>
              <li>{t("dataDeletion.include2")}</li>
              <li>{t("dataDeletion.include3")}</li>
            </Box>

            <Typography
              variant="body1"
              sx={{
                mb: 3,
                fontSize: "1rem",
                lineHeight: 1.6,
                color: "#1d1d1f",
                fontWeight: 500,
              }}
            >
              {t("dataDeletion.timeline")}
            </Typography>

            <Box
              sx={{
                backgroundColor: "rgba(0, 122, 255, 0.1)",
                border: "1px solid rgba(0, 122, 255, 0.2)",
                borderRadius: 2,
                p: 3,
                mb: 3,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "#1d1d1f",
                  fontWeight: 500,
                }}
              >
                {t("dataDeletion.contactInfo")}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              onClick={handleEmailClick}
              sx={{
                py: 2,
                px: 4,
                fontSize: "0.875rem",
                fontWeight: 400,
                backgroundColor: "#007AFF",
                borderRadius: 2,
                textTransform: "none",
                letterSpacing: "-0.01em",
                "&:hover": {
                  backgroundColor: "#0056CC",
                },
              }}
            >
              {t("dataDeletion.sendEmail")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{
                py: 2,
                px: 4,
                fontSize: "0.875rem",
                fontWeight: 400,
                borderColor: "rgba(0, 0, 0, 0.1)",
                color: "#1d1d1f",
                borderRadius: 2,
                textTransform: "none",
                letterSpacing: "-0.01em",
                "&:hover": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              {t("dataDeletion.backToHome")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DataDeletion;
