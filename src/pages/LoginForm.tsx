import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const { signIn, resetPassword, signInWithGoogle, signInWithFacebook } =
    useUserContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first");
      return;
    }

    setResetLoading(true);
    setError("");
    setResetMessage("");

    const { error } = await resetPassword(email);

    if (error) {
      setError(t("auth.resetPasswordError"));
    } else {
      setResetMessage(t("auth.resetPasswordSent"));
    }

    setResetLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // Note: If successful, user will be redirected to dashboard
  };

  const handleFacebookSignIn = async () => {
    setFacebookLoading(true);
    setError("");

    const { error } = await signInWithFacebook();

    if (error) {
      setError(error.message);
      setFacebookLoading(false);
    }
    // Note: If successful, user will be redirected to dashboard
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

        {/* Login Form */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 400,
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
              mb: 2,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              letterSpacing: "-0.01em",
            }}
          >
            {t("auth.login")}
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              mb: 4,
              fontWeight: 400,
              color: "#86868b",
              fontSize: "0.875rem",
              letterSpacing: "-0.01em",
            }}
          >
            {t("auth.signIn")} to your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: "rgba(255, 59, 48, 0.1)",
                  border: "0.5px solid rgba(255, 59, 48, 0.2)",
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {resetMessage && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  backgroundColor: "rgba(52, 199, 89, 0.1)",
                  border: "0.5px solid rgba(52, 199, 89, 0.2)",
                  borderRadius: 2,
                }}
              >
                {resetMessage}
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading || facebookLoading}
              startIcon={<GoogleIcon />}
              sx={{
                py: 2,
                mb: 2,
                fontSize: "0.875rem",
                fontWeight: 400,
                borderColor: "#dadce0",
                color: "#3c4043",
                borderRadius: 2,
                textTransform: "none",
                letterSpacing: "-0.01em",
                backgroundColor: "#ffffff",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                  borderColor: "#dadce0",
                  boxShadow:
                    "0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)",
                },
                "&:disabled": {
                  backgroundColor: "#f8f9fa",
                  borderColor: "#dadce0",
                  color: "#9aa0a6",
                },
              }}
            >
              {googleLoading
                ? t("common.loading")
                : t("auth.continueWithGoogle")}
            </Button>

            {/* Facebook Sign In Button */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleFacebookSignIn}
              disabled={facebookLoading || loading || googleLoading}
              startIcon={<FacebookIcon />}
              sx={{
                py: 2,
                mb: 3,
                fontSize: "0.875rem",
                fontWeight: 400,
                borderColor: "#1877f2",
                color: "#1877f2",
                borderRadius: 2,
                textTransform: "none",
                letterSpacing: "-0.01em",
                backgroundColor: "#ffffff",
                "&:hover": {
                  backgroundColor: "#f0f2f5",
                  borderColor: "#1877f2",
                  boxShadow:
                    "0 1px 2px 0 rgba(24,119,242,.3), 0 1px 3px 1px rgba(24,119,242,.15)",
                },
                "&:disabled": {
                  backgroundColor: "#f8f9fa",
                  borderColor: "#dadce0",
                  color: "#9aa0a6",
                },
              }}
            >
              {facebookLoading
                ? t("common.loading")
                : t("auth.continueWithFacebook")}
            </Button>

            {/* Divider */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  px: 2,
                  color: "#86868b",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                }}
              >
                or
              </Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>

            <TextField
              required
              fullWidth
              id="email"
              label={t("auth.email")}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 122, 255, 0.5)",
                  },
                },
              }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label={t("auth.password")}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 122, 255, 0.5)",
                  },
                },
              }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: "right", mb: 3 }}>
              <Button
                variant="text"
                onClick={handleResetPassword}
                disabled={resetLoading}
                sx={{
                  textTransform: "none",
                  color: "#007AFF",
                  fontWeight: 400,
                  fontSize: "0.875rem",
                  p: 0,
                  minWidth: "auto",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "#0056CC",
                  },
                  "&:disabled": {
                    color: "#C7C7CC",
                  },
                }}
              >
                {resetLoading ? t("common.loading") : t("auth.forgotPassword")}
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
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
              {loading ? t("common.loading") : t("auth.signIn")}
            </Button>

            <Box textAlign="center" sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#86868b",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                }}
              >
                {t("auth.noAccount")}{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/signup")}
                  sx={{
                    textTransform: "none",
                    color: "#007AFF",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "#0056CC",
                    },
                  }}
                >
                  {t("auth.signUp")}
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginForm;
