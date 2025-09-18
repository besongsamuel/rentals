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
import EmailVerificationMessage from "../components/EmailVerificationMessage";
import Header from "../components/Header";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useUserContext } from "../contexts/UserContext";

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useUserContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("errors.passwordMismatch"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("errors.password"));
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(t("auth.signupSuccess"));
    }

    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 500,
              p: { xs: 4, sm: 5 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {/* Language Switcher */}
            <Box
              sx={{
                position: "absolute",
                top: { xs: 16, sm: 20 },
                right: { xs: 16, sm: 20 },
              }}
            >
              <LanguageSwitcher />
            </Box>
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                component="img"
                src="/app_logo.png"
                alt="ko kumba Logo"
                sx={{
                  height: "64px",
                  width: "auto",
                  display: "block",
                  mb: 2,
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                  background:
                    "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textAlign: "center",
                  mb: 1,
                }}
              >
                ko kumba
              </Typography>
            </Box>

            <Typography
              component="h1"
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 600,
                textAlign: "center",
                color: "text.primary",
                mb: 1,
              }}
            >
              {t("auth.signup")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 3, fontWeight: 500 }}
            >
              {t("auth.signupWelcome")}
            </Typography>

            <Box
              sx={{
                mb: 4,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                align="left"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                {t("auth.chooseRole")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="left"
                sx={{ mb: 1 }}
              >
                • <strong>{t("auth.driverSignup")}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" align="left">
                • <strong>{t("auth.ownerSignup")}</strong>
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && <EmailVerificationMessage email={email} />}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t("auth.email")}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("auth.password")}
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={t("errors.password")}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label={t("auth.confirmPassword")}
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
                disabled={loading}
              >
                {loading ? t("common.loading") : t("auth.signUp")}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2">
                  {t("auth.hasAccount")}{" "}
                  <Button
                    variant="text"
                    onClick={() =>
                      navigate("/login", { state: { mode: "login" } })
                    }
                    sx={{ textTransform: "none" }}
                  >
                    {t("auth.signIn")}
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default SignUpForm;
