import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";

const SignupComplete: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f2f2f7",
        py: 4,
      }}
    >
      {/* Language Switcher */}
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <LanguageSwitcher />
      </Box>

      <Container
        maxWidth="sm"
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
            mb: 6,
          }}
        >
          <Box
            component="img"
            src="/app_logo.png"
            alt="mo kumbi"
            sx={{
              height: 64,
              width: "auto",
              mb: 3,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "2rem", sm: "2.5rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            mo kumbi
          </Typography>
        </Box>

        {/* Success Content */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 500,
            p: 4,
            background: "#ffffff",
            border: "0.5px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          {/* Success Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "rgba(0, 122, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "2.5rem",
                color: "#007AFF",
              }}
            >
              ✓
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              color: "#1d1d1f",
              letterSpacing: "-0.01em",
              mb: 3,
            }}
          >
            {t("auth.signupComplete")}
          </Typography>

          {/* Email Check Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                fontSize: "1.1rem",
                color: "#1d1d1f",
                letterSpacing: "-0.01em",
                mb: 2,
              }}
            >
              {t("auth.checkEmailTitle")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                fontSize: "0.875rem",
                color: "#86868b",
                letterSpacing: "-0.01em",
                lineHeight: 1.5,
                mb: 3,
              }}
            >
              {t("auth.checkEmailMessage")}
            </Typography>
          </Box>

          {/* Next Steps Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                fontSize: "1.1rem",
                color: "#1d1d1f",
                letterSpacing: "-0.01em",
                mb: 2,
              }}
            >
              {t("auth.nextStepsTitle")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                fontSize: "0.875rem",
                color: "#86868b",
                letterSpacing: "-0.01em",
                lineHeight: 1.5,
              }}
            >
              {t("auth.nextStepsMessage")}
            </Typography>
          </Box>

          {/* Back to Login Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/login")}
            sx={{
              py: 2,
              fontSize: "0.875rem",
              fontWeight: 400,
              backgroundColor: "#007AFF",
              borderRadius: 2,
              textTransform: "none",
              letterSpacing: "-0.01em",
              "&:hover": {
                backgroundColor: "#0056CC",
              },
              "&:disabled": {
                backgroundColor: "#C7C7CC",
                color: "#8E8E93",
              },
            }}
          >
            {t("auth.backToLogin")}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupComplete;
