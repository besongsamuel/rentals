import { Box, Container, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SignupAuthMethodSelector from "../components/SignupAuthMethodSelector";
import { useUserContext } from "../contexts/UserContext";

const EnhancedSignUpForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp, signUpWithPhone, verifyPhoneOTP } = useUserContext();

  const [error, setError] = useState("");

  const handleEmailSignup = async (email: string, password: string) => {
    setError("");
    const { error } = await signUp(email, password);
    if (error) {
      throw error;
    }
    // If successful, user will be redirected by the auth state change
  };

  const handlePhoneSignup = async (phone: string) => {
    setError("");
    const { error } = await signUpWithPhone(phone);
    if (error) {
      throw error;
    }
  };

  const handleVerifyPhoneOTP = async (phone: string, otp: string) => {
    setError("");
    const { error } = await verifyPhoneOTP(phone, otp);
    if (error) {
      throw error;
    }
    // If successful, user will be redirected by the auth state change
  };

  const handleResendPhoneOTP = async (phone: string) => {
    setError("");
    const { error } = await signUpWithPhone(phone);
    if (error) {
      throw error;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f2f7" }}>
      <Container
        component="main"
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
            src="/site-logo-800x800.png"
            alt="mo kumbi"
            onClick={() => navigate("/")}
            sx={{
              height: 64,
              width: "auto",
              mb: 3,
              cursor: "pointer",
              transition: "opacity 0.2s ease-in-out",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 400,
              fontSize: { xs: "2rem", sm: "2.5rem" },
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textAlign: "center",
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
            variant="body1"
            sx={{
              fontWeight: 400,
              fontSize: "0.75rem",
              color: "#86868b",
              letterSpacing: "-0.01em",
              textAlign: "center",
              mt: 0.5,
              textTransform: "lowercase",
            }}
          >
            {t("auth.driverSubtext")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "#86868b",
              letterSpacing: "-0.01em",
              textAlign: "center",
              mt: 2,
              maxWidth: 300,
              lineHeight: 1.4,
            }}
          >
            {t("auth.serviceDescription")}
          </Typography>
        </Box>

        {/* Enhanced Signup Form */}
        <SignupAuthMethodSelector
          onEmailSignup={handleEmailSignup}
          onPhoneSignup={handlePhoneSignup}
          onVerifyPhoneOTP={handleVerifyPhoneOTP}
          onResendPhoneOTP={handleResendPhoneOTP}
          error={error}
        />

        {/* Sign In Link */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#86868b",
              fontSize: "0.875rem",
              fontWeight: 400,
            }}
          >
            {t("auth.hasAccount")}{" "}
            <Box
              component="span"
              onClick={() => navigate("/login")}
              sx={{
                color: "#007AFF",
                cursor: "pointer",
                fontWeight: 500,
                "&:hover": {
                  color: "#0056CC",
                  textDecoration: "underline",
                },
              }}
            >
              {t("auth.signIn")}
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default EnhancedSignUpForm;
