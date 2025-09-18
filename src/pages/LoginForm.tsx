import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useUserContext } from "../contexts/UserContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useUserContext();
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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f2f7" }}>
      {/* Language Switcher */}
      <Box
        sx={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 1,
        }}
      >
        <LanguageSwitcher />
      </Box>

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
            src="/app_logo.png"
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
              color: "#1d1d1f",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            mo kumbi
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
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 122, 255, 0.5)",
                  },
                },
              }}
            />

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

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default LoginForm;
