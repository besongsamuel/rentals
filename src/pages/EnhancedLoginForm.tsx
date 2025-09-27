import { Box, Container, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AuthMethodSelector from "../components/AuthMethodSelector";
import { useUserContext } from "../contexts/UserContext";

const EnhancedLoginForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signInWithPhoneOTP, verifyPhoneOTP, signInWithGoogle, signInWithFacebook, signUpWithOtp } = useUserContext();

  const [error, setError] = useState("");

  const handleEmailAuth = async (email: string, password: string) => {
    setError("");
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
    // If successful, user will be redirected by the auth state change
  };

  const handlePhoneAuth = async (phone: string) => {
    setError("");
    const { error } = await signInWithPhoneOTP(phone);
    if (error) {
      throw error;
    }
  };

  const handleVerifyOTP = async (phone: string, otp: string) => {
    setError("");
    const { error } = await verifyPhoneOTP(phone, otp);
    if (error) {
      throw error;
    }
    // If successful, user will be redirected by the auth state change
  };

  const handleResendOTP = async (phone: string) => {
    setError("");
    const { error } = await signInWithPhoneOTP(phone);
    if (error) {
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      throw error;
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    const { error } = await signInWithFacebook();
    if (error) {
      throw error;
    }
  };

  const handleMagicLinkLogin = async (email: string) => {
    setError("");
    const { error } = await signUpWithOtp(email);
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

        {/* Enhanced Authentication Form */}
        <AuthMethodSelector
          onEmailAuth={handleEmailAuth}
          onPhoneAuth={handlePhoneAuth}
          onVerifyOTP={handleVerifyOTP}
          onResendOTP={handleResendOTP}
          onGoogleLogin={handleGoogleLogin}
          onFacebookLogin={handleFacebookLogin}
          onMagicLinkLogin={handleMagicLinkLogin}
          error={error}
        />

        {/* Sign Up Link */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#86868b",
              fontSize: "0.875rem",
              fontWeight: 400,
            }}
          >
            {t("auth.noAccount")}{" "}
            <Box
              component="span"
              onClick={() => navigate("/signup")}
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
              {t("auth.signUp")}
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default EnhancedLoginForm;
